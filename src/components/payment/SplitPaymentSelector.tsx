
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Wallet, CreditCard } from 'lucide-react';
import { formatPrice } from '@/utils/pricingCalculator';

interface SplitPaymentSelectorProps {
  totalAmount: number;
  walletBalance: number;
  onSplitChange: (walletAmount: number, cardAmount: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const SplitPaymentSelector = ({
  totalAmount,
  walletBalance,
  onSplitChange,
  enabled,
  onEnabledChange
}: SplitPaymentSelectorProps) => {
  const [walletAmount, setWalletAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(totalAmount);

  const maxWalletUsage = Math.min(walletBalance, totalAmount);

  useEffect(() => {
    if (enabled) {
      const defaultWalletAmount = Math.min(walletBalance, totalAmount);
      setWalletAmount(defaultWalletAmount);
      setCardAmount(totalAmount - defaultWalletAmount);
      onSplitChange(defaultWalletAmount, totalAmount - defaultWalletAmount);
    } else {
      setWalletAmount(0);
      setCardAmount(totalAmount);
      onSplitChange(0, totalAmount);
    }
  }, [enabled, totalAmount, walletBalance, onSplitChange]);

  const handleSliderChange = (values: number[]) => {
    const newWalletAmount = values[0];
    const newCardAmount = totalAmount - newWalletAmount;
    setWalletAmount(newWalletAmount);
    setCardAmount(newCardAmount);
    onSplitChange(newWalletAmount, newCardAmount);
  };

  const handleWalletInputChange = (value: string) => {
    const amount = Math.min(parseInt(value) * 100 || 0, maxWalletUsage);
    const newCardAmount = totalAmount - amount;
    setWalletAmount(amount);
    setCardAmount(newCardAmount);
    onSplitChange(amount, newCardAmount);
  };

  if (walletBalance === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Split Payment</span>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            className="data-[state=checked]:bg-emerald-500"
          />
        </CardTitle>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-400">
            Use your wallet balance along with another payment method
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 mb-2 block">
                Wallet Amount: {formatPrice(walletAmount)}
              </Label>
              <Slider
                value={[walletAmount]}
                onValueChange={handleSliderChange}
                max={maxWalletUsage}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹0</span>
                <span>{formatPrice(maxWalletUsage)} (Max)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">From Wallet</Label>
                <div className="flex items-center space-x-2 p-3 bg-emerald-900/20 rounded-lg border border-emerald-700">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  <Input
                    type="number"
                    value={walletAmount / 100}
                    onChange={(e) => handleWalletInputChange(e.target.value)}
                    max={maxWalletUsage / 100}
                    className="border-0 bg-transparent text-white p-0 h-auto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">From Card</Label>
                <div className="flex items-center space-x-2 p-3 bg-blue-900/20 rounded-lg border border-blue-700">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-medium">
                    {formatPrice(cardAmount)}
                  </span>
                </div>
              </div>
            </div>

            {walletBalance < totalAmount && (
              <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                Insufficient wallet balance. Remaining {formatPrice(cardAmount)} will be charged to your selected payment method.
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SplitPaymentSelector;
