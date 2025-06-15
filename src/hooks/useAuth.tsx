
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserRole as fetcher } from '@/hooks/useRoleFetcher';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ data?: any; error?: any }>;
  resetPasswordWithPhone: (phone: string, newPassword: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('=== Auth Provider State ===');
  console.log('User:', user?.email || 'None');
  console.log('Role:', role || 'None');
  console.log('Loading:', loading);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Session found for:', session.user.email);
          setUser(session.user);
          // Start role fetch but don't wait for it to complete
          fetchUserRole(session.user.id, session.user);
        } else {
          console.log('No session found');
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email || 'No user');
      
      if (session?.user) {
        setUser(session.user);
        // Fetch role but don't block the UI
        fetchUserRole(session.user.id, session.user);
      } else {
        setUser(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string, userObj?: User | null) => {
    try {
      const userRole = await fetcher(userId, userObj);
      setRole(userRole);
      console.log('Role fetched:', userRole);
    } catch (error) {
      console.error('Error fetching role:', error);
      // Default to customer if role fetch fails
      setRole('customer');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const resetPasswordWithPhone = async (phone: string, newPassword: string) => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('phone', phone)
        .single();

      if (profileError || !profiles) {
        return { error: { message: 'Phone number not found' } };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    role,
    loading,
    signOut,
    signIn,
    signUp,
    resetPasswordWithPhone,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
