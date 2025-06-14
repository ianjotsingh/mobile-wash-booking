
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobileLoginProps {
  onSuccess: () => void;
  userType?: 'customer' | 'provider' | null;
}

const MobileLogin = ({ onSuccess, userType = 'customer' }: MobileLoginProps) => {
  const [step, setStep] = useState<'main' | 'email' | 'forgot-password'>('main');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleEmailAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!email || !password || (isSignup && !fullName)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (isSignup) {
        console.log('Starting signup process for:', email);
        const userData = {
          full_name: fullName,
          role: userType,
          ...(phoneNumber && { phone: phoneNumber })
        };

        result = await signUp(email, password, userData);
        
        if (result.error) {
          console.error('Signup error:', result.error);
          
          let errorMessage = result.error.message;
          if (errorMessage.includes('User already registered')) {
            errorMessage = "Account exists. Please use 'Sign In' option.";
          } else if (errorMessage.includes('Password')) {
            errorMessage = "Password must be at least 6 characters long.";
          } else if (errorMessage.includes('Invalid email')) {
            errorMessage = "Please enter a valid email address.";
          }
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          console.log('Signup result:', result);
          
          if (result.needsConfirmation) {
            toast({
              title: "Account Created",
              description: "Account created successfully! You can now sign in.",
            });
            setIsSignup(false); // Switch to sign in mode
          } else if (result.data?.session) {
            toast({
              title: "Success",
              description: "Account created and logged in successfully!",
            });
            // Call onSuccess immediately when we have a session
            onSuccess();
          } else {
            // Account created but no session - user needs to sign in
            toast({
              title: "Account Created",
              description: "Account created! Please sign in to continue.",
            });
            setIsSignup(false); // Switch to sign in mode
          }
        }
      } else {
        console.log('Starting login process for:', email);
        result = await signIn(email, password);
        
        if (result.error) {
          console.error('Login error:', result.error);
          
          let errorMessage = result.error.message;
          if (errorMessage.includes('Invalid login credentials')) {
            errorMessage = "Invalid email or password. Please check your credentials.";
          } else if (errorMessage.includes('Email not confirmed')) {
            errorMessage = "Please check your email and click the confirmation link.";
          } else if (errorMessage.includes('Too many requests')) {
            errorMessage = "Too many login attempts. Please wait and try again.";
          }
          
          toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive"
          });
        } else if (result.data?.session) {
          console.log('Login successful for:', email);
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
          // Call onSuccess immediately when we have a session
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.error) {
        console.error('Password reset error:', result.error);
        toast({
          title: "Error",
          description: "Failed to send reset email. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Email Sent!",
          description: "Check your email for a link to reset your password. Click the link in the email to set a new password.",
        });
        setStep('email');
        setIsSignup(false);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMain = () => {
    setStep('main');
    setEmail('');
    setPassword('');
    setFullName('');
    setPhoneNumber('');
    setIsSignup(false);
  };

  const handleEmailStep = (signup = false) => {
    setIsSignup(signup);
    setStep('email');
  };

  const handleForgotPasswordStep = () => {
    setStep('forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex flex-col">
      <div className="flex-1 px-4 pt-4 pb-8 flex items-center justify-center">
        <div className="bg-white bg-opacity-100 rounded-3xl shadow-2xl p-8 mx-auto max-w-sm mt-6 w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">WC</span>
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-base font-medium">
              {userType === 'provider' ? 'Service Provider Login' : 'Customer Login'}
            </p>
          </div>

          {/* Step Content */}
          {step === 'main' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Button 
                  onClick={() => handleEmailStep(false)}
                  className="w-full h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold touch-manipulation"
                >
                  Sign In with Email
                </Button>
                <Button 
                  onClick={() => handleEmailStep(true)}
                  variant="outline" 
                  className="w-full h-12 rounded-xl flex items-center justify-center text-blue-600 border-blue-600 hover:bg-blue-50 touch-manipulation"
                >
                  Create New Account
                </Button>
              </div>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-6">
              {isSignup && (
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl bg-blue-50"
                  required
                />
              )}
              
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-blue-50"
                required
              />
              
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl bg-blue-50"
                required
                minLength={6}
              />

              {isSignup && (
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Phone Number (Optional)</label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 border border-r-0 border-gray-200 rounded-l-xl bg-blue-50">
                      <span className="text-base font-bold">🇮🇳 +91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-l-none rounded-r-xl bg-blue-50 text-lg"
                      maxLength={10}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-900 text-white h-14 rounded-2xl font-bold touch-manipulation"
              >
                {loading ? (isSignup ? 'Creating Account...' : 'Signing In...') : (isSignup ? 'Create Account' : 'Sign In')}
              </Button>

              {!isSignup && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleForgotPasswordStep}
                  className="w-full text-blue-500 touch-manipulation"
                >
                  Forgot Password?
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToMain}
                className="w-full text-blue-500 touch-manipulation"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login Options
              </Button>
            </form>
          )}

          {step === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Reset Password</h2>
                <p className="text-gray-600 text-sm">Enter your email to receive reset instructions</p>
              </div>

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-blue-50"
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-900 text-white h-14 rounded-2xl font-bold touch-manipulation"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('email')}
                className="w-full text-blue-500 touch-manipulation"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          )}

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center mt-6 select-none">
            By continuing, you agree to our{' '}
            <span className="text-blue-700 underline font-semibold cursor-pointer">Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
