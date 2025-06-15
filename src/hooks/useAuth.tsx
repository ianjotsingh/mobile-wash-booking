
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  console.log('=== Auth Provider Initializing ===');

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Auth loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    const initializeAuth = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          clearTimeout(loadingTimeout);
          return;
        }

        if (session?.user) {
          console.log('Initial session found for user:', session.user.email);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          console.log('No initial session found');
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        console.log('Initial session check completed - setting loading to false');
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'No user');
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
      
      if (loading) {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // Default to customer if role fetch fails
        setRole('customer');
        return;
      }

      const userRole = data?.role || 'customer';
      console.log('User role fetched:', userRole);
      setRole(userRole);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setRole('customer'); // Default fallback
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
      // Find user by phone number
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('phone', phone)
        .single();

      if (profileError || !profiles) {
        return { error: { message: 'Phone number not found' } };
      }

      // For demo purposes, we'll simulate a password reset
      // In a real app, you'd need a proper phone verification flow
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
