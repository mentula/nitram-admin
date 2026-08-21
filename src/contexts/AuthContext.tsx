import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConnected } from '@/lib/supabase';
import type { UserRole } from '@/lib/database.types';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  department: string | null;
  is_active: boolean;
}

// Demo user for preview mode
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@nitramclearing.co.zm',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const DEMO_PROFILE: Profile = {
  id: 'demo-user-123',
  email: 'demo@nitramclearing.co.zm',
  full_name: 'Demo Admin',
  role: 'super_admin',
  avatar_url: null,
  phone: '+260-XXX-XXXXXX',
  department: 'Administration',
  is_active: true,
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseConnected;

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // If in demo mode, auto-login as demo user
    if (isDemoMode) {
      console.log('🎭 Demo Mode Active - Auto-logged in as Demo Admin');
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setSession(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // In demo mode, accept any credentials
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    if (isDemoMode) {
      return { error: { message: 'Sign up disabled in demo mode' } as AuthError };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error };

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'customer', // Default role
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    if (isDemoMode) {
      // In demo mode, just clear state
      setUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    if (isDemoMode) {
      return { error: { message: 'Password reset disabled in demo mode' } as AuthError };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (isDemoMode) {
      return { error: new Error('Profile updates disabled in demo mode') };
    }

    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchProfile(user.id);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Check if user has specific role(s)
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!profile) return false;
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    return profile.role === role;
  };

  // Convenience role checks
  const isAdmin = hasRole(['super_admin', 'manager']);
  const isStaff = hasRole(['super_admin', 'manager', 'sales_agent', 'logistics_officer', 'content_manager']);
  const isCustomer = hasRole('customer');

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    hasRole,
    isAdmin,
    isStaff,
    isCustomer,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
