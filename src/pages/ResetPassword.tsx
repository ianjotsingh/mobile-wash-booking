import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log('Password reset page loaded');
      console.log('Full URL:', window.location.href);
      console.log('Search params:', window.location.search);
      console.log('Hash:', window.location.hash);
      
      setCheckingSession(true);

      // Get parameters from both URL search and hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for tokens in both locations
      const accessToken = urlParams.get('access_token') || 
                         hashParams.get('access_token') ||
                         searchParams.get('access_token');
      
      const refreshToken = urlParams.get('refresh_token') || 
                          hashParams.get('refresh_token') ||
                          searchParams.get('refresh_token');
      
      const type = urlParams.get('type') || 
                   hashParams.get('type') ||
                   searchParams.get('type');
      
      const error = urlParams.get('error') || 
                    hashParams.get('error') ||
                    searchParams.get('error');
      
      const errorDescription = urlParams.get('error_description') || 
                              hashParams.get('error_description') ||
                              searchParams.get('error_description');

      console.log('Extracted parameters:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
        type,
        error,
        errorDescription,
        hasSearchParams: window.location.search.length > 0,
        hasHashParams: window.location.hash.length > 0
      });

      // Handle errors first
      if (error) {
        console.error('URL contains error:', error, errorDescription);
        setCheckingSession(false);
        setIsValidSession(false);
        toast({
          title: "Reset Link Error",
          description: errorDescription || "The reset link has an error. Please request a new password reset.",
          variant: "destructive"
        });
        return;
      }

      // Check if this is a recovery request
      if (type !== 'recovery') {
        console.error('Invalid type parameter:', type);
        setCheckingSession(false);
        setIsValidSession(false);
        toast({
          title: "Invalid Reset Link",
          description: "This link is not a valid password reset link. Please request a new one.",
          variant: "destructive"
        });
        return;
      }

      // Check if we have access token
      if (!accessToken) {
        console.error('Missing access token');
        setCheckingSession(false);
        setIsValidSession(false);
        toast({
          title: "Invalid Reset Link", 
          description: "This password reset link is missing required parameters. Please request a new one.",
          variant: "destructive"
        });
        return;
      }

      try {
        console.log('Setting session with access token...');
        
        // Set the session using the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        console.log('Session setup result:', {
          user: data.user?.email,
          hasSession: !!data.session,
          error: sessionError?.message
        });

        if (sessionError) {
          console.error('Session setup error:', sessionError);
          setCheckingSession(false);
          setIsValidSession(false);
          toast({
            title: "Session Error",
            description: "The reset link is invalid or has expired. Please request a new password reset.",
            variant: "destructive"
          });
          return;
        }

        if (data.session && data.user) {
          console.log('Valid session established for user:', data.user.email);
          setIsValidSession(true);
          setCheckingSession(false);
          toast({
            title: "Ready to Reset Password",
            description: `You can now set a new password for ${data.user.email}`,
          });
        } else {
          console.error('No valid session or user returned');
          setCheckingSession(false);
          setIsValidSession(false);
          toast({
            title: "Session Error",
            description: "Could not establish a valid session. Please request a new password reset.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Unexpected error during session setup:', error);
        setCheckingSession(false);
        setIsValidSession(false);
        toast({
          title: "Unexpected Error",
          description: "An error occurred while processing your reset link. Please try again.",
          variant: "destructive"
        });
      }
    };

    handlePasswordReset();
  }, [toast, searchParams]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidSession) {
      toast({
        title: "Session Error",
        description: "Invalid session. Please request a new password reset link.",
        variant: "destructive"
      });
      return;
    }

    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both password fields",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Updating password...');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Password updated successfully');
        setIsSuccess(true);
        toast({
          title: "Password Updated!",
          description: "Your password has been changed successfully. Redirecting to login...",
        });
        
        // Sign out and redirect after a delay
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Unexpected error during password update:', error);
      toast({
        title: "Unexpected Error",
        description: "An error occurred while updating your password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 via-white to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Password Updated!</h2>
              <p className="text-gray-600 mb-4">
                Your password has been successfully changed. You will be redirected to the login page shortly.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Go to Login Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-2xl">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying Reset Link...</h2>
              <p className="text-gray-600">Please wait while we verify your password reset link.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid session state
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-100 via-white to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-xl font-bold text-red-800 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-4">
                This password reset link is invalid, missing parameters, or has expired. Please request a new one from the login page.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">WC</span>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-12"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 h-12"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 h-12 text-base"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/')}
                className="text-blue-600"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
