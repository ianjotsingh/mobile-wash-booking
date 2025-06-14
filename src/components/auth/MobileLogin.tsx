import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 px-6 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 mx-auto max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">WC</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Welcome to WashCart</h1>
            <p className="text-gray-600">Your Vehicle Service, On-Demand</p>
          </div>

          {/* User Type Tabs */}
          <div className="mb-6">
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'customer' | 'provider')}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="customer" 
                  className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Customer
                </TabsTrigger>
                <TabsTrigger 
                  value="provider"
                  className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Service Provider
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter your phone number</h3>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50">
                    <span className="text-sm">🇮🇳 +91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-l-none rounded-r-xl"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>

              <div className="text-center">
                <span className="text-gray-500">or continue with</span>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full h-12 rounded-xl" disabled>
                  <div className="w-5 h-5 bg-red-500 rounded mr-2"></div>
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full h-12 rounded-xl" disabled>
                  <div className="w-5 h-5 bg-black rounded mr-2"></div>
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
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl"
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
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl"
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

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our{' '}
            <span className="text-blue-600">Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
