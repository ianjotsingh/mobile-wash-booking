
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPasswordWithPhone: (phone: string, newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth listeners...');
    
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    getInitialSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Signed out successfully');
        // Clear any cached data
        localStorage.removeItem('userLocationSet');
        localStorage.removeItem('hasCompletedOnboarding');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPasswordWithPhone = async (phone: string, newPassword: string) => {
    try {
      console.log('Starting phone-based password reset for:', phone);
      
      // Check if user exists with this phone number
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, phone')
        .eq('phone', phone)
        .single();

      if (profileError || !userProfile) {
        console.error('User not found with phone:', phone);
        return { 
          data: null, 
          error: { message: 'No account found with this phone number' }
        };
      }

      // Update password using admin privileges (this would need to be done via edge function in production)
      // For now, we'll use the client method which requires the user to be authenticated
      // In a real app, you'd want to implement this via a secure edge function
      
      // Get the user's email to send a password reset
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userProfile.user_id);
      
      if (authError || !authUser.user) {
        console.error('Could not retrieve user:', authError);
        return { 
          data: null, 
          error: { message: 'Unable to reset password. Please try again.' }
        };
      }

      // Send password reset email as fallback
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        authUser.user.email!,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (resetError) {
        console.error('Password reset error:', resetError);
        return { 
          data: null, 
          error: { message: 'Failed to reset password' }
        };
      }

      console.log('Password reset email sent successfully');
      return { 
        data: { success: true }, 
        error: null 
      };
    } catch (error) {
      console.error('Phone reset error:', error);
      return { 
        data: null, 
        error: { message: 'An error occurred. Please try again.' }
      };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      console.log('Signup result:', { 
        user: data.user?.email, 
        session: !!data.session,
        error: error?.message,
        emailConfirmed: data.user?.email_confirmed_at
      });
      
      if (error) {
        // If user already exists, try to sign them in
        if (error.message.includes('User already registered')) {
          console.log('User exists, trying to sign in...');
          return await signIn(email, password);
        }
        return { data: null, error };
      }
      
      // Check if user is immediately confirmed (like in development)
      if (data.user && data.session) {
        console.log('User immediately confirmed with session');
        return { data, error: null };
      }
      
      // If we have a user but no session, email confirmation is needed
      if (data.user && !data.session) {
        console.log('User created but needs email confirmation');
        return { 
          data, 
          error: null, 
          needsConfirmation: true 
        };
      }
      
      return { data, error };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Sign in result:', { 
        user: data.user?.email, 
        session: !!data.session,
        error: error?.message 
      });
      
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPasswordWithPhone
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
