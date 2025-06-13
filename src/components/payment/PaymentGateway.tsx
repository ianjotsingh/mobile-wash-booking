
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Lock, CreditCard } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  orderDetails: {
    orderId: string;
    description: string;
  };
  paymentMethod: string;
  walletAmount?: number;
  onSuccess: (paymentId: string) => void;
  onError?: (error: string) => void;
}

const PaymentGateway = ({
  amount,
  orderDetails,
  paymentMethod,
  walletAmount = 0,
  onSuccess,
  onError
}: PaymentGatewayProps) => {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const processPayment = async () => {
    if (paymentMethod === 'cash') {
      // For cash payments, just mark as pending
      onSuccess('cash_payment_pending');
      return;
    }

    setProcessing(true);

    try {
      // For demo purposes, we'll simulate payment processing
      // In a real app, this would integrate with Razorpay SDK
      
      if (walletAmount > 0) {
        // Process wallet deduction first
        const currentBalance = parseInt(localStorage.getItem(`wallet_${user?.id}`) || '0');
        const newBalance = currentBalance - walletAmount;
        localStorage.setItem(`wallet_${user?.id}`, newBalance.toString());
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast({
        title: "Payment Successful!",
        description: `Payment of ₹${amount / 100} completed successfully`
      });

      onSuccess(paymentId);
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = 'Payment failed. Please try again.';
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      onError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentButtonText = () => {
    if (processing) return 'Processing...';
    if (paymentMethod === 'cash') return 'Confirm Booking';
    if (walletAmount > 0 && walletAmount < amount) {
      return `Pay ₹${((amount - walletAmount) / 100).toFixed(0)} + Use Wallet`;
    }
    if (walletAmount >= amount) return 'Pay from Wallet';
    return `Pay ₹${(amount / 100).toFixed(0)}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-300 mb-2">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Secure Payment</span>
        </div>
        <div className="text-xs text-gray-500">
          Your payment information is encrypted and secure
        </div>
      </div>

      <Button
        onClick={processPayment}
        disabled={processing}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3"
        size="lg"
      >
        <CreditCard className="h-5 w-5 mr-2" />
        {getPaymentButtonText()}
      </Button>

      {paymentMethod === 'cash' && (
        <div className="text-center text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg">
          You can pay in cash after the service is completed
        </div>
      )}
    </div>
  );
};

export default PaymentGateway;
