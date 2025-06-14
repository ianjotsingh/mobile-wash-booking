
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Phone, Mail } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobileLoginProps {
  onSuccess: () => void;
}

const MobileLogin = ({ onSuccess }: MobileLoginProps) => {
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer');
  const [step, setStep] = useState<'phone' | 'otp' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // For demo purposes, we'll simulate OTP sending
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "Verification code sent to your phone"
      });
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // For demo purposes, we'll simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      onSuccess();
      toast({
        title: "Success",
        description: "Phone number verified successfully"
      });
    }, 1000);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-white">WC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome to WashCart</h1>
      </div>

      {/* User Type Tabs */}
      <div className="px-6 mb-6">
        <Tabs value={userType} onValueChange={(value) => setUserType(value as 'customer' | 'provider')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="provider">Service Provider</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Login Content */}
      <div className="flex-1 px-6">
        <Card>
          <CardContent className="p-6">
            {step === 'phone' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                      <span className="text-sm">🇮🇳 +91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>

                <div className="text-center">
                  <span className="text-gray-500">or</span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setStep('email')}
                  className="w-full h-12"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Email
                </Button>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full h-12" disabled>
                    <img src="/api/placeholder/20/20" alt="Google" className="mr-2" />
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full h-12" disabled>
                    <img src="/api/placeholder/20/20" alt="Apple" className="mr-2" />
                    Continue with Apple
                  </Button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-6 text-center">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Enter OTP</h3>
                  <p className="text-gray-600">
                    Enter the 6-digit code sent to +91 {phoneNumber}
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep('phone')}
                  className="w-full"
                >
                  Change Phone Number
                </Button>
              </div>
            )}

            {step === 'email' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep('phone')}
                  className="w-full"
                >
                  Back to Phone Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-6 px-4">
          By continuing, you agree to our{' '}
          <span className="text-emerald-600">Terms of Service</span>
        </p>
      </div>
    </div>
  );
};

export default MobileLogin;
