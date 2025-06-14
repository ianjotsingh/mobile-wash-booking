import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Phone } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateOTP, storeOTP, verifyOTP } from '@/utils/otpService';

interface MobileLoginProps {
  onSuccess: () => void;
  userType?: 'customer' | 'provider' | null;
}

const MobileLogin = ({ onSuccess, userType = 'customer' }: MobileLoginProps) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate OTP
      const generatedOTP = generateOTP();
      
      // Store OTP locally
      storeOTP(phoneNumber, generatedOTP);

      // Send OTP via Twilio
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          phone: phoneNumber,
          otp: generatedOTP
        }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('OTP sent successfully:', data);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to +91${phoneNumber}`,
      });

    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const isValid = verifyOTP(phoneNumber, otp);
      
      if (!isValid) {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect or has expired. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // OTP is valid, proceed with authentication
      onSuccess();
      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });

    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
          {step === 'phone' && (
            <div className="space-y-7">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-left">Enter your phone number</h3>
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
              <Button
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length < 10}
                className="w-full bg-blue-700 hover:bg-blue-900 text-white h-14 rounded-2xl text-lg font-extrabold shadow"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
              <div className="text-center text-gray-400 text-sm select-none">
                or continue with
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-center text-gray-600 bg-gray-50" disabled>
                  <div className="w-5 h-5 bg-red-500 rounded mr-2"></div>
                  Continue with Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl flex items-center justify-center text-gray-600 bg-gray-50"
                  onClick={() => setStep('email')}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded mr-2"></div>
                  Continue with Email
                </Button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-7 text-center">
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
                className="w-full bg-blue-700 hover:bg-blue-900 text-white h-14 rounded-2xl font-bold"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full text-blue-500 font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Phone Number
              </Button>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-6">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-blue-50"
              />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl bg-blue-50"
              />
              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-900 text-white h-14 rounded-2xl font-bold"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full text-blue-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
