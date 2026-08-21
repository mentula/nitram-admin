import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import type { Database } from '@/lib/database.types';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

export function useDocuments(filters?: {
  category?: string;
  customer_id?: string;
  shipment_id?: string;
  quote_id?: string;
}) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select(`
          *,
          customer:customers(company_name),
          shipment:shipments(shipment_number),
          quote:quotes(quote_number),
          uploaded_by_profile:profiles!documents_uploaded_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }
      if (filters?.shipment_id) {
        query = query.eq('shipment_id', filters.shipment_id);
      }
      if (filters?.quote_id) {
        query = query.eq('quote_id', filters.quote_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          customer:customers(company_name),
          shipment:shipments(shipment_number),
          quote:quotes(quote_number),
          uploaded_by_profile:profiles!documents_uploaded_by_fkey(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: DocumentInsert) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...document,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.DOCUMENT_UPLOADED,
        entity_type: 'document',
        entity_id: data.id,
        details: { name: data.name, category: data.category },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DocumentUpdate }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logActivity({
        action: 'document.updated',
        entity_type: 'document',
        entity_id: data.id,
        details: { name: data.name },
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('company-documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete database record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logActivity({
        action: ActivityTypes.DOCUMENT_DELETED,
        entity_type: 'document',
        entity_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({ file, category }: { file: File; category?: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${category || 'general'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-documents')
        .getPublicUrl(filePath);

      return {
        filePath,
        publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    },
  });
}

export const DOCUMENT_CATEGORIES = [
  'License',
  'Certificate',
  'Compliance',
  'Tax Document',
  'Registration',
  'Insurance',
  'Contract',
  'Invoice',
  'Other',
] as const;
