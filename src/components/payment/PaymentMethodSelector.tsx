
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Building, Wallet, Banknote } from 'lucide-react';
import { PaymentMethod } from '@/types/payment';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
  availableMethods?: PaymentMethod[];
}

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodSelect, 
  availableMethods 
}: PaymentMethodSelectorProps) => {
  const defaultMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      details: 'Visa, Mastercard, RuPay'
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI Payment',
      details: 'GPay, PhonePe, Paytm, etc.'
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      name: 'Net Banking',
      details: 'All major banks supported'
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Digital Wallet',
      details: 'Paytm, PhonePe, Amazon Pay'
    },
    {
      id: 'cash',
      type: 'cash',
      name: 'Cash on Service',
      details: 'Pay after service completion'
    }
  ];

  const methods = availableMethods || defaultMethods;

  const getIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'upi':
        return <Smartphone className="h-5 w-5" />;
      case 'netbanking':
        return <Building className="h-5 w-5" />;
      case 'wallet':
        return <Wallet className="h-5 w-5" />;
      case 'cash':
        return <Banknote className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodSelect}>
          <div className="space-y-3">
            {methods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3">
                <RadioGroupItem 
                  value={method.id} 
                  id={method.id}
                  className="border-gray-600 text-emerald-500" 
                />
                <Label
                  htmlFor={method.id}
                  className="flex items-center space-x-3 flex-1 cursor-pointer p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="text-emerald-400">
                    {getIcon(method.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{method.name}</div>
                    <div className="text-sm text-gray-400">{method.details}</div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
