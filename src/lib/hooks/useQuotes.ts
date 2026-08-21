import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import type { Database } from '@/lib/database.types';

type Quote = Database['public']['Tables']['quotes']['Row'];
type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];
type QuoteUpdate = Database['public']['Tables']['quotes']['Update'];

/**
 * Hook to fetch all quotes
 */
export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, customer:customers(company_name), lead:leads(contact_name), created_by:profiles!quotes_created_by_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Quote[];
    },
  });
}

/**
 * Hook to fetch a single quote by ID
 */
export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, customer:customers(*), lead:leads(*), created_by:profiles!quotes_created_by_fkey(full_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Quote;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new quote
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quote: QuoteInsert) => {
      const { data, error } = await supabase
        .from('quotes')
        .insert(quote as any)
        .select()
        .single();

      if (error) throw error;
      return data as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

/**
 * Hook to update a quote
 */
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: QuoteUpdate }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Quote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] });
    },
  });
}

/**
 * Hook to delete a quote
 */
export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

/**
 * Hook to create a quote from assessment form (public access)
 * This is specifically for the public assessment form
 */
export function useCreateQuoteFromAssessment() {
  return useMutation({
    mutationFn: async (data: {
      leadId: string;
      service: string;
      origin: string;
      destination: string;
      borderOfEntry: string;
      cargoType: string;
      cargoDescription?: string;
      borderClearanceType: string;
    }) => {
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          lead_id: data.leadId,
          service_type: data.service,
          origin: data.origin,
          destination: data.destination,
          cargo_description: data.cargoDescription
            ? `${data.cargoType}\n\nBorder of Entry: ${data.borderOfEntry}\nBorder Clearance Type: ${data.borderClearanceType}\n\nDescription:\n${data.cargoDescription}`
            : `${data.cargoType}\n\nBorder of Entry: ${data.borderOfEntry}\nBorder Clearance Type: ${data.borderClearanceType}`,
          status: 'draft',
          notes: `Quote request from website assessment at ${new Date().toLocaleString()}`,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return quote as Quote;
    },
  });
}

/**
 * Hook to approve a quote
 */
export function useApproveQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      // 1. Update quote status to approved and mark as approved
      const { data, error } = await supabase
        .from('quotes')
        .update({ status: 'approved', approved: true } as any)
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.QUOTE_APPROVED,
        entity_type: 'quote',
        entity_id: data.id,
        details: { 
          quote_number: data.quote_number,
          status: data.status,
        },
      });

      // 2. Prepare customer ID - use existing customer or create from lead
      let customerId = data.customer_id;
      
      if (!customerId && data.lead_id) {
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', data.lead_id)
          .single();
        
        if (leadError || !lead) {
          throw new Error('Linked lead not found for quote conversion');
        }
        
        if (lead.converted_to_customer) {
          customerId = lead.converted_to_customer;
        } else {
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert({
              company_name: lead.company_name || `${lead.contact_name} Company`,
              contact_person: lead.contact_name,
              email: lead.email,
              phone: lead.phone,
              country: 'Zambia',
              status: 'prospect',
            } as any)
            .select()
            .single();
          
          if (customerError || !customer) {
            throw new Error('Failed to create customer from lead');
          }
          
          customerId = customer.id;
          
          await supabase
            .from('leads')
            .update({ status: 'won', converted_to_customer: customer.id } as any)
            .eq('id', lead.id);
        }
      }
      
      // 3. Create shipment from quote data
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          customer_id: customerId,
          quote_id: data.id,
          origin: data.origin || 'Unknown',
          destination: data.destination || 'Unknown',
          cargo_description: data.cargo_description,
          status: 'awaiting_collection',
        } as any)
        .select()
        .single();

      if (shipmentError) throw shipmentError;

      // 4. Generate unique tracking token for the shipment
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let token = '';
      for (let i = 0; i < 8; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Ensure unique token
      let tokenExists = true;
      let attempts = 0;
      let uniqueToken = token;
      
      while (tokenExists && attempts < 10) {
        const { data: existingToken } = await supabase
          .from('tracking_tokens')
          .select('token')
          .eq('token', uniqueToken)
          .single();
        
        if (!existingToken) {
          tokenExists = false;
        } else {
          uniqueToken = '';
          for (let i = 0; i < 8; i++) {
            uniqueToken += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          attempts++;
        }
      }
      
// 5. Insert tracking token
       const { data: tokenData, error: tokenInsertError } = await supabase
         .from('tracking_tokens')
         .insert({
           token: uniqueToken,
           shipment_id: shipment.id,
           customer_id: customerId,
           current_step: 1,
           status: 'active',
         } as any)
         .select()
         .single();

       if (tokenInsertError) {
         console.error('Error inserting tracking token:', tokenInsertError.response?.data || tokenInsertError.message);
         throw new Error(`Failed to create tracking token: ${tokenInsertError.message}`);
       }

      await logActivity({
        action: ActivityTypes.SHIPMENT_CREATED,
        entity_type: 'shipment',
        entity_id: shipment.id,
        details: { 
          shipment_number: shipment.shipment_number,
          quote_number: data.quote_number,
          tracking_token: uniqueToken,
        },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote', data.id] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['tracking-tokens'] });
    },
  });
}

/**
 * Hook to convert an approved quote to a shipment
 */
export function useConvertQuoteToShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) {
        throw new Error('Quote not found');
      }

      let customerId = quote.customer_id;

      // If the quote has no customer, try to create one from a linked lead.
      if (!customerId && quote.lead_id) {
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', quote.lead_id)
          .single();

        if (leadError || !lead) {
          throw new Error('Linked lead not found for quote conversion');
        }

        if (lead.converted_to_customer) {
          customerId = lead.converted_to_customer;
        } else {
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .insert({
              company_name: lead.company_name || `${lead.contact_name} Company`,
              contact_person: lead.contact_name,
              email: lead.email,
              phone: lead.phone,
              country: 'Zambia',
              status: 'prospect',
            } as any)
            .select()
            .single();

          if (customerError || !customer) {
            throw new Error('Failed to create customer from lead');
          }

          customerId = customer.id;

          await supabase
            .from('leads')
            .update({ status: 'won', converted_to_customer: customer.id } as any)
            .eq('id', lead.id);
        }

        await supabase
          .from('quotes')
          .update({ customer_id: customerId } as any)
          .eq('id', quoteId);
      }

      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          customer_id: customerId,
          quote_id: quote.id,
          origin: quote.origin || 'Unknown',
          destination: quote.destination || 'Unknown',
          cargo_description: quote.cargo_description,
          status: 'awaiting_collection',
        } as any)
        .select()
        .single();

      if (shipmentError) throw shipmentError;

      await supabase
        .from('quotes')
        .update({ status: 'converted' } as any)
        .eq('id', quoteId);

      await logActivity({
        action: ActivityTypes.QUOTE_CONVERTED,
        entity_type: 'quote',
        entity_id: quote.id,
        details: { quote_number: quote.quote_number, shipment_id: shipment.id },
      });

      return { quote, shipment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
    },
  });
}
