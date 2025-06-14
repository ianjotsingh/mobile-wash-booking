
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
    const setupSession = async () => {
      console.log('Setting up password reset session...');
      console.log('Current URL:', window.location.href);
      console.log('Search params:', Object.fromEntries(searchParams));
      
      setCheckingSession(true);
      
      // Check for different possible parameter formats
      const accessToken = searchParams.get('access_token') || searchParams.get('token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      console.log('URL params:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type,
        error,
        errorDescription
      });

      // Check for errors in URL first
      if (error) {
        console.log('Error in URL parameters:', error, errorDescription);
        setCheckingSession(false);
        toast({
          title: "Reset Link Error",
          description: errorDescription || "The reset link has an error. Please request a new password reset.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      // Check if we have the required tokens
      if (!accessToken || type !== 'recovery') {
        console.log('Missing required parameters for password reset');
        setCheckingSession(false);
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new one from the login page.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Attempt to set the session using the tokens from the URL
        const sessionData = {
          access_token: accessToken,
          refresh_token: refreshToken || ''
        };
        
        console.log('Attempting to set session with tokens...');
        const { data, error } = await supabase.auth.setSession(sessionData);
        
        if (error) {
          console.error('Session setup error:', error);
          setCheckingSession(false);
          toast({
            title: "Session Error",
            description: "Unable to verify reset link. The link may have expired. Please request a new password reset.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (data.session && data.user) {
          console.log('Session established successfully for user:', data.user.email);
          setIsValidSession(true);
          setCheckingSession(false);
          toast({
            title: "Ready to Reset Password",
            description: `You can now create a new password for ${data.user.email}`,
          });
        } else {
          console.log('No valid session created despite no error');
          setCheckingSession(false);
          toast({
            title: "Session Error",
            description: "Could not establish a valid session. Please request a new password reset.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Unexpected error during session setup:', error);
        setCheckingSession(false);
        toast({
          title: "Unexpected Error",
          description: "An error occurred while processing your reset link. Please try requesting a new password reset.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    setupSession();
  }, [searchParams, navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
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
          title: "Password Updated Successfully!",
          description: "Your password has been changed. You will be redirected to login.",
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

  // Main password reset form
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
          <form onSubmit={handlePasswordReset} className="space-y-6">
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
