
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
  const [step, setStep] = useState<'main' | 'email'>('main');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { signIn, signUp } = useAuth();
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

    setLoading(true);
    try {
      if (isSignup) {
        console.log('Attempting signup for:', email);
        const userData = {
          full_name: fullName,
          role: userType,
          ...(phoneNumber && { phone: phoneNumber })
        };

        const { data, error } = await signUp(email, password, userData);
        console.log('Signup result:', { data, error });
        
        if (error) {
          console.error('Signup error:', error);
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log('Signup successful!');
          toast({
            title: "Success",
            description: "Account created successfully! You can now sign in.",
          });
          // After successful signup, automatically call onSuccess
          onSuccess();
        }
      } else {
        console.log('Attempting login for:', email);
        const { data, error } = await signIn(email, password);
        console.log('Login result:', { data, error });
        
        if (error) {
          console.error('Login error:', error);
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log('Login successful!');
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
    setLoading(false);
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
