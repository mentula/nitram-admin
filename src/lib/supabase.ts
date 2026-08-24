import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Vercel injects the project Supabase variables with NEXT_PUBLIC_ prefixes.
// Keep VITE_ support for local development and older deployments.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Allow placeholder values for UI preview
const isPlaceholder = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('placeholder') || 
  supabaseAnonKey.includes('placeholder');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables - using placeholder mode');
  console.warn('⚠️  App will show UI but database features will not work');
  console.warn('⚠️  Add real credentials to .env.local to enable full functionality');
}

// Use placeholder values if not set, so app can still render
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzY0MjQ3OTAsImV4cCI6MTk1MjAwMDc5MH0.placeholder';

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConnected = !isPlaceholder;

// Helper function to handle Supabase errors with user-friendly messages
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('relation') && msg.includes('does not exist')) {
      return 'Database tables not found. Please run the database setup script (FIX_DATABASE.sql) in the Supabase SQL Editor.';
    }
    if (msg.includes('row level security') || msg.includes('rls')) {
      return 'Permission denied. Please check your account role or run the RLS policies setup script.';
    }
    if (msg.includes('jwt') || msg.includes('token')) {
      return 'Authentication error. Please log out and log in again.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
      return 'This record already exists. Please refresh and try again.';
    }
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return 'Data validation error. Please check the information and try again.';
    }
    return error.message;
  }
  return 'An unknown error occurred';
}

// Storage helpers
export const storage = {
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    return data;
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  downloadFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) throw error;
    return data;
  },

  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  listFiles: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage.from(bucket).list(path);
    if (error) throw error;
    return data;
  },
};
