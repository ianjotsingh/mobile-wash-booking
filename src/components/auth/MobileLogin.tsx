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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 px-4 pt-4 pb-8">
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 mx-auto max-w-sm mt-12 slide-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white tracking-wide drop-shadow">WC</span>
            </div>
            <h1 className="text-2xl font-extrabold text-blue-800 mb-2">Welcome to WashCart</h1>
            <p className="text-gray-500 text-base font-medium">Your Vehicle Service, On-Demand</p>
          </div>

          {/* User Type Tabs */}
          <div className="mb-6">
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'customer' | 'provider')}>
              <TabsList className="grid w-full grid-cols-2 bg-blue-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="customer" 
                  className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-base"
                >
                  Customer
                </TabsTrigger>
                <TabsTrigger 
                  value="provider"
                  className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold text-base"
                >
                  Service Provider
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Step Content */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-left">Enter your phone number</h3>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 border border-r-0 border-gray-200 rounded-l-xl bg-blue-50">
                    <span className="text-sm font-medium">🇮🇳 +91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-l-none rounded-r-xl bg-blue-50"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-lg font-bold shadow"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>

              <div className="text-center mt-2">
                <span className="text-gray-400 text-sm">or continue with</span>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-center text-gray-600 bg-gray-50" disabled>
                  <div className="w-5 h-5 bg-red-500 rounded mr-2"></div>
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-center text-gray-600 bg-gray-50" disabled>
                  <div className="w-5 h-5 bg-black rounded mr-2"></div>
                  Continue with Apple
                </Button>
              </div>
            </div>
          )}
          {step === 'otp' && (
            <div className="space-y-6 text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-700">Enter OTP</h3>
                <p className="text-gray-600">
                  Enter the 6-digit code sent to +91 {phoneNumber}
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="gap-3"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full text-blue-500 font-semibold"
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
                  className="rounded-xl bg-blue-50"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl bg-blue-50"
                />
              </div>
              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full text-blue-500"
              >
                Back to Phone Login
              </Button>
            </div>
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
