
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Phone } from 'lucide-react';

interface OtpVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const OtpVerification = ({ phoneNumber, onVerificationSuccess, onBack }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyOtp } = useAuth();
  const { toast } = useToast();

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await verifyOtp(phoneNumber, otp);

      if (error) {
        console.error('OTP verification error:', error);
        toast({
          title: "Verification failed",
          description: error.message || "Invalid OTP. Please try again.",
          variant: "destructive"
        });
      } else if (data?.user) {
        toast({
          title: "Success",
          description: "Phone number verified successfully!"
        });
        onVerificationSuccess();
      }
    } catch (error) {
      console.error('Unexpected OTP verification error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Verify Phone Number
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to {phoneNumber}
        </p>
        
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

        <div className="space-y-2">
          <Button
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp.length !== 6}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isVerifying}
            className="w-full"
          >
            Back to Phone Input
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OtpVerification;
