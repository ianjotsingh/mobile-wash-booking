
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AuthModal = ({ children, open: controlledOpen, onOpenChange }: AuthModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast({
          title: "Error",
          description: "Failed to sign in with Google. Please try again.",
          variant: "destructive"
        });
      } else {
        setOpen(false);
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', loginData.email);
      const { data, error } = await signIn(loginData.email, loginData.password);

      if (error) {
        console.error('Login error:', error);
        let errorMessage = "Invalid email or password";
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (data?.user) {
        console.log('Login successful for user:', data.user.email);
        toast({
          title: "Success",
          description: "Logged in successfully!"
        });
        setOpen(false);
        setLoginData({ email: '', password: '' });
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.email || !signupData.password || !signupData.fullName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting signup with:', signupData.email);
      const userData = {
        full_name: signupData.fullName,
        role: 'customer',
        ...(signupData.phone && { phone: signupData.phone })
      };

      const { data, error } = await signUp(signupData.email, signupData.password, userData);

      if (error) {
        console.error('Signup error:', error);
        let errorMessage = "Failed to create account";
        
        if (error.message?.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (error.message?.includes('Password')) {
          errorMessage = "Password must be at least 6 characters long.";
        }
        
        toast({
          title: "Signup Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (data?.user) {
        console.log('Signup successful for user:', data.user.email);
        toast({
          title: "Success",
          description: data.user.email_confirmed_at 
            ? "Account created successfully!" 
            : "Account created! Please check your email for confirmation."
        });
        setOpen(false);
        setSignupData({ email: '', password: '', fullName: '', phone: '' });
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to WashCart</DialogTitle>
        </DialogHeader>
        
        {/* Google Sign In Button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 flex items-center justify-center space-x-3"
        >
          <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded"></div>
          <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
        </Button>

        <div className="text-center text-gray-400 text-sm mb-4">or</div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="signup-phone">Phone (Optional)</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                  disabled={loading}
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="Create a secure password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
