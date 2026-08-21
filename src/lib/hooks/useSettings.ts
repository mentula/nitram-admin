import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logActivity, ActivityTypes } from '@/lib/activity-log';
import type { Database } from '@/lib/database.types';

type Setting = Database['public']['Tables']['settings']['Row'];
type SettingInsert = Database['public']['Tables']['settings']['Insert'];
type SettingUpdate = Database['public']['Tables']['settings']['Update'];

/**
 * Fetch all settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;

      // Convert to key-value object for easier access
      const settingsObj: Record<string, any> = {};
      data.forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });

      return { raw: data, parsed: settingsObj };
    },
  });
}

/**
 * Fetch a specific setting by key
 */
export function useSetting(key: string) {
  return useQuery({
    queryKey: ['setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!key,
  });
}

/**
 * Update or create a setting
 */
export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value, 
      description 
    }: { 
      key: string; 
      value: any; 
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Check if setting exists
      const { data: existing } = await supabase
        .from('settings')
        .select('key')
        .eq('key', key)
        .maybeSingle();

      let data;
      if (existing) {
        // Update existing setting
        const { data: updated, error } = await supabase
          .from('settings')
          .update({
            value,
            description,
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq('key', key)
          .select()
          .single();

        if (error) throw error;
        data = updated;
      } else {
        // Create new setting
        const { data: created, error } = await supabase
          .from('settings')
          .insert({
            key,
            value,
            description,
            updated_by: user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        data = created;
      }

      await logActivity({
        action: ActivityTypes.SETTINGS_UPDATED,
        entity_type: 'setting',
        entity_id: key,
        details: { key },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Update multiple settings at once
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Array<{ key: string; value: any; description?: string }>) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Process each setting
      const promises = settings.map(async ({ key, value, description }) => {
        const { data: existing } = await supabase
          .from('settings')
          .select('key')
          .eq('key', key)
          .maybeSingle();

        if (existing) {
          return supabase
            .from('settings')
            .update({
              value,
              description,
              updated_by: user?.id,
              updated_at: new Date().toISOString(),
            })
            .eq('key', key);
        } else {
          return supabase
            .from('settings')
            .insert({
              key,
              value,
              description,
              updated_by: user?.id,
            });
        }
      });

      await Promise.all(promises);

      await logActivity({
        action: ActivityTypes.SETTINGS_UPDATED,
        entity_type: 'settings',
        entity_id: 'bulk',
        details: { count: settings.length },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Delete a setting
 */
export function useDeleteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('key', key);

      if (error) throw error;

      await logActivity({
        action: 'setting.deleted',
        entity_type: 'setting',
        entity_id: key,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

/**
 * Helper to get a typed setting value
 */
export function getSettingValue<T = any>(settings: Record<string, any> | undefined, key: string, defaultValue: T): T {
  if (!settings) return defaultValue;
  return settings[key] !== undefined ? settings[key] : defaultValue;
}
