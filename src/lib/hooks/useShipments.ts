import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import { generateTrackingToken } from '@/lib/hooks/useTracking';
import type { Database } from '@/lib/database.types';

type Shipment = Database['public']['Tables']['shipments']['Row'];
type ShipmentInsert = Database['public']['Tables']['shipments']['Insert'];
type ShipmentUpdate = Database['public']['Tables']['shipments']['Update'];
type ShipmentStatus = Database['public']['Enums']['shipment_status'];
type ShipmentTimelineEntry = Database['public']['Tables']['shipment_timeline']['Insert'];

export function useShipments() {
  return useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          customer:customers(id, company_name, contact_person, email),
          assigned_to_profile:profiles!shipments_assigned_to_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          customer:customers(id, company_name, contact_person, email, phone),
          quote:quotes(id, quote_number, service_type),
          assigned_to_profile:profiles!shipments_assigned_to_fkey(full_name, email),
          created_by_profile:profiles!shipments_created_by_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useShipmentTimeline(shipmentId: string) {
  return useQuery({
    queryKey: ['shipment-timeline', shipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipment_timeline')
        .select(`
          *,
          created_by_profile:profiles!shipment_timeline_created_by_fkey(full_name, email)
        `)
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!shipmentId,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipment: ShipmentInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('shipments')
        .insert({
          ...shipment,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial timeline entry
      await supabase.from('shipment_timeline').insert({
        shipment_id: data.id,
        status: data.status,
        location: data.origin,
        notes: 'Shipment created',
        created_by: user?.id,
      });

      // Auto-generate tracking token
      let token = generateTrackingToken();
      let tokenAttempts = 0;
      
      // Ensure unique token
      while (tokenAttempts < 10) {
        const { data: existingToken } = await supabase
          .from('tracking_tokens')
          .select('token')
          .eq('token', token)
          .single();
        
        if (!existingToken) break;
        token = generateTrackingToken();
        tokenAttempts++;
      }

      // Create tracking token
      await supabase.from('tracking_tokens').insert({
        token,
        shipment_id: data.id,
        current_step: 1,
        status: 'active',
      });

      await logActivity({
        action: ActivityTypes.SHIPMENT_CREATED,
        entity_type: 'shipment',
        entity_id: data.id,
        details: { 
          shipment_number: data.shipment_number,
          tracking_token: token,
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['tracking-tokens'] });
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ShipmentUpdate }) => {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.SHIPMENT_UPDATED,
        entity_type: 'shipment',
        entity_id: data.id,
        details: { shipment_number: data.shipment_number, status: data.status },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      location,
      notes,
    }: {
      id: string;
      status: ShipmentStatus;
      location?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Update shipment
      const { data, error } = await supabase
        .from('shipments')
        .update({ status, current_location: location })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Add timeline entry
      const { error: timelineError } = await supabase.from('shipment_timeline').insert({
        shipment_id: id,
        status,
        location,
        notes,
        created_by: user?.id,
      });
      if (timelineError) throw new Error('Shipment status was not recorded');

      await logActivity({
        action: ActivityTypes.SHIPMENT_STATUS_CHANGED,
        entity_type: 'shipment',
        entity_id: data.id,
        details: { shipment_number: data.shipment_number, new_status: status },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['shipment-timeline', variables.id] });
    },
  });
}

export function useAddTimelineEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: ShipmentTimelineEntry) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('shipment_timeline')
        .insert({
          ...entry,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipment-timeline', variables.shipment_id] });
    },
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.SHIPMENT_DELETED,
        entity_type: 'shipment',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
