import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import type { Database } from '@/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];
type LeadStatus = Database['public']['Enums']['lead_status'];

/**
 * Hook to fetch all leads
 */
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*, assigned_to:profiles!leads_assigned_to_fkey(full_name), converted_to_customer:customers(company_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });
}

/**
 * Fetch a single lead by ID
 */
export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();  // Ensure single result

      if (error) throw error;
      if (!data) throw new Error('Lead not found');
      // Validate data is an object
      if (Array.isArray(data)) {
        throw new Error('Unexpected array result from query');
      }

      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: LeadInsert) => {
      const { data, error } = await (supabase
        .from('leads')
        .insert(lead as any)
        .select('*') as any);

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

/**
 * Hook to update a lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: LeadUpdate }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates as any)
        .eq('id', id)
        .select('*');

      if (error) {
        console.error('Failed to update lead:', error);
        throw error;
      }
      
      // data is an array from .select('*')
      const updatedLead = (data as any)?.[0];
      if (!updatedLead) {
        throw new Error('No data returned after update');
      }
      
      return updatedLead as Lead;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
    },
  });
}

/**
 * Hook to delete a lead
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

/**
 * Hook to create a lead from assessment form (public access)
 * This is specifically for the public assessment form
 */
export function useCreateLeadFromAssessment() {
  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      company?: string;
      email: string;
      phone: string;
      service: string;
    }) => {
      const { data: lead, error } = await (supabase
        .from('leads')
        .insert({
          contact_name: data.fullName,
          company_name: data.company || null,
          email: data.email,
          phone: data.phone,
          service_needed: data.service,
          source: 'Website Assessment',
          status: 'new',
          notes: `Lead captured from website assessment form at ${new Date().toLocaleString()}`,
        } as any)
        .select('*')
        .single() as any);

      if (error) throw error;
      return lead as Lead;
    },
  });
}

/**
 * Hook to convert a lead to a customer
 */
export function useConvertLeadToCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await (supabase as any).rpc('convert_lead_to_customer_workflow', {
        p_lead_id: leadId,
      });
      if (error) throw new Error('Unable to accept lead');
      if (!data?.customer) throw new Error('Customer was not created');

      await logActivity({
        action: ActivityTypes.CUSTOMER_CREATED,
        entity_type: 'customer',
        entity_id: data.customer,
        details: { converted_from_lead: leadId, existing: data.existing },
      });

      return { customer: { id: data.customer }, lead: { id: data.lead } };
    },
    onSuccess: () => {
      console.log('📦 Invalidating queries after conversion');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });
}

/**
 * Hook to update a lead's status (for kanban drag-and-drop)
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status } as any)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.LEAD_UPDATED,
        entity_type: 'lead',
        entity_id: data.id,
        details: { new_status: status },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
    },
  });
}
