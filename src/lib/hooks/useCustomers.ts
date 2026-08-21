import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import type { Database } from '@/lib/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          assigned_to_profile:profiles!customers_assigned_to_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) { console.error('useCustomers error:', error); throw error; }
      console.log('useCustomers data:', data); return data as Customer[];
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          assigned_to_profile:profiles!customers_assigned_to_fkey(full_name, email),
          created_by_profile:profiles!customers_created_by_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Customer;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const result = await (supabase
        .from('customers')
        .insert({
          ...customer,
          created_by: user?.id,
        } as any)
        .select()
        .single() as any);
      
      const { data, error } = result;
      if (error) throw error;

      await logActivity({
        action: ActivityTypes.CUSTOMER_CREATED,
        entity_type: 'customer',
        entity_id: data!.id,
        details: { company_name: data!.company_name },
      });

      return data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CustomerUpdate }) => {
      const result = await (supabase
        .from('customers')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single() as any);
      
      const { data, error } = result;
      if (error) throw error;

      await logActivity({
        action: ActivityTypes.CUSTOMER_UPDATED,
        entity_type: 'customer',
        entity_id: data!.id,
        details: { company_name: data!.company_name },
      });

      return data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.CUSTOMER_DELETED,
        entity_type: 'customer',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Get customer timeline (quotes, shipments, documents, etc.)
export function useCustomerTimeline(customerId: string) {
  return useQuery({
    queryKey: ['customer-timeline', customerId],
    queryFn: async () => {
      const [quotes, shipments, documents] = await Promise.all([
        supabase
          .from('quotes')
          .select('id, quote_number, service_type, estimated_cost, status, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase
          .from('shipments')
          .select('id, shipment_number, origin, destination, status, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase
          .from('documents')
          .select('id, name, file_type, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
      ]);

      // Combine and sort all timeline events
      const timeline: any[] = [];

      quotes.data?.forEach((quote) => {
        timeline.push({
          type: 'quote',
          date: quote.created_at,
          data: quote,
        });
      });

      shipments.data?.forEach((shipment) => {
        timeline.push({
          type: 'shipment',
          date: shipment.created_at,
          data: shipment,
        });
      });

      documents.data?.forEach((document) => {
        timeline.push({
          type: 'document',
          date: document.created_at,
          data: document,
        });
      });

      return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!customerId,
  });
}
