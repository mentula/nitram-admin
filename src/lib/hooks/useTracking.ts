import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import type { Database } from '@/lib/database.types';

type TrackingToken = Database['public']['Tables']['tracking_tokens']['Row'];
type TrackingTokenInsert = Database['public']['Tables']['tracking_tokens']['Insert'];
type TrackingTokenUpdate = Database['public']['Tables']['tracking_tokens']['Update'];

/**
 * Generate a unique 8-character alphanumeric tracking token
 */
export function generateTrackingToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Ensure token is unique by checking database
 */
async function generateUniqueToken(): Promise<string> {
  let token = generateTrackingToken();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data } = await supabase
      .from('tracking_tokens')
      .select('token')
      .eq('token', token)
      .single();

    if (!data) {
      return token;
    }

    token = generateTrackingToken();
    attempts++;
  }

  throw new Error('Failed to generate unique tracking token after multiple attempts');
}

/**
 * Fetch tracking information by token (public access, no auth required)
 */
export function useTrackingByToken(token: string | null) {
  return useQuery({
    queryKey: ['tracking', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');

      const { data, error } = await (supabase as any).rpc('track_shipment_by_token', {
        p_token: token,
      });

      if (error || !data?.shipment) throw new Error('Shipment not found');
      return {
        token,
        current_step: Math.max(1, Math.min(8, data.events?.length || 1)),
        status: data.shipment.status === 'delivered' ? 'completed' : data.shipment.status === 'cancelled' ? 'cancelled' : 'active',
        notes: data.events?.at(-1)?.notes ?? null,
        updated_at: data.shipment.updated_at,
        shipment: data.shipment,
        events: data.events ?? [],
      };
    },
    enabled: !!token && token.length === 8,
  });
}

/**
 * Fetch all tracking tokens (admin only)
 */
export function useTrackingTokens() {
  return useQuery({
    queryKey: ['tracking-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Get tracking token by shipment ID
 */
export function useTrackingByShipment(shipmentId: string | null) {
  return useQuery({
    queryKey: ['tracking-by-shipment', shipmentId],
    queryFn: async () => {
      if (!shipmentId) throw new Error('Shipment ID is required');

      const { data, error } = await supabase
        .from('tracking_tokens')
        .select('*')
        .eq('shipment_id', shipmentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!shipmentId,
  });
}

/**
 * Create a new tracking token
 */
export function useCreateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tracking: Omit<TrackingTokenInsert, 'token'>) => {
      const token = await generateUniqueToken();

      const { data, error } = await supabase
        .from('tracking_tokens')
        .insert({
          ...tracking,
          token,
          current_step: tracking.current_step || 1,
          status: tracking.status || 'active',
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.SHIPMENT_CREATED,
        entity_type: 'tracking_token',
        entity_id: data.id,
        details: { 
          token: data.token,
          shipment_id: data.shipment_id,
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-tokens'] });
    },
  });
}

/**
 * Update tracking step and notes
 */
export function useUpdateTrackingStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      current_step, 
      notes,
      status,
    }: { 
      id: string; 
      current_step: number; 
      notes?: string;
      status?: 'active' | 'completed' | 'cancelled';
    }) => {
      const updates: TrackingTokenUpdate = {
        current_step,
        notes,
      };

      // Auto-complete tracking when step 8 is reached
      if (current_step === 8 && !status) {
        updates.status = 'completed';
      } else if (status) {
        updates.status = status;
      }

      const { data, error } = await supabase
        .from('tracking_tokens')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.SHIPMENT_STATUS_CHANGED,
        entity_type: 'tracking_token',
        entity_id: data.id,
        details: { 
          token: data.token,
          current_step: data.current_step,
          status: data.status,
        },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['tracking', data.token] });
      if (data.shipment_id) {
        queryClient.invalidateQueries({ queryKey: ['tracking-by-shipment', data.shipment_id] });
      }
    },
  });
}

/**
 * Update full tracking token
 */
export function useUpdateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TrackingTokenUpdate }) => {
      const { data, error } = await supabase
        .from('tracking_tokens')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.SHIPMENT_UPDATED,
        entity_type: 'tracking_token',
        entity_id: data.id,
        details: { 
          token: data.token,
        },
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-tokens'] });
      queryClient.invalidateQueries({ queryKey: ['tracking', data.token] });
      if (data.shipment_id) {
        queryClient.invalidateQueries({ queryKey: ['tracking-by-shipment', data.shipment_id] });
      }
    },
  });
}

/**
 * Delete a tracking token
 */
export function useDeleteTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tracking_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        action: 'tracking_token.deleted',
        entity_type: 'tracking_token',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-tokens'] });
    },
  });
}

/**
 * Get the 8 clearance process steps
 */
export const CLEARANCE_STEPS = [
  {
    step: 1,
    title: 'Client Enquiry',
    description: 'You contact Nitram with your cargo requirements. We respond promptly to understand your needs, timelines, and any specific requirements for your shipment.',
  },
  {
    step: 2,
    title: 'Cargo Assessment',
    description: 'Our team assesses your cargo — type, volume, origin, destination, value, and applicable classification — to identify the correct customs procedures, documentation, and duty obligations.',
  },
  {
    step: 3,
    title: 'Documentation Review',
    description: 'We review all cargo documentation for completeness and accuracy before submission to customs. Incomplete or inaccurate documents are the number one cause of clearance delays — we resolve issues proactively.',
  },
  {
    step: 4,
    title: 'Quotation',
    description: 'We provide a clear, detailed quotation covering professional fees, applicable duties, taxes, and any other charges. No hidden fees, no surprises — you know exactly what you are paying and why.',
  },
  {
    step: 5,
    title: 'Appoint Nitram on the ZRA Portal',
    description: 'To authorize us to act on your behalf, appoint Nitram Logistics Limited as your licensed clearing agent through the Zambia Revenue Authority (ZRA) online portal. This secure electronic appointment is required before we can submit customs declarations on your behalf.',
  },
  {
    step: 6,
    title: 'Customs Clearance',
    description: 'We submit all required declarations and documentation to the relevant customs authority and manage the clearance process from submission to cargo release, liaising directly with customs officials on your behalf.',
  },
  {
    step: 7,
    title: 'Transportation',
    description: 'Once cargo is released by customs, we coordinate transportation to the final destination. Where Nitram\'s trucking service is engaged, we manage the full transport movement; where you have your own transporter, we coordinate the handover seamlessly.',
  },
  {
    step: 8,
    title: 'Successful Delivery',
    description: 'Your cargo arrives at its destination safely, on time, and in the condition it left the origin. We provide confirmation of delivery and all relevant clearance documentation for your records.',
  },
] as const;
