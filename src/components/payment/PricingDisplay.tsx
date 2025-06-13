
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingBreakdown, formatPrice } from '@/utils/pricingCalculator';
import { Tag, Receipt } from 'lucide-react';

interface PricingDisplayProps {
  pricing: PricingBreakdown;
  promoCode?: string;
}

const PricingDisplay = ({ pricing, promoCode }: PricingDisplayProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Receipt className="h-5 w-5" />
          <span>Price Breakdown</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-gray-300">
          <span>Service Fee</span>
          <span>{formatPrice(pricing.basePrice)}</span>
        </div>
        
        {pricing.discount > 0 && (
          <div className="flex justify-between text-green-400">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Discount</span>
              {promoCode && (
                <Badge variant="secondary" className="text-xs">
                  {promoCode}
                </Badge>
              )}
            </div>
            <span>-{formatPrice(pricing.discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-300">
          <span>Subtotal</span>
          <span>{formatPrice(pricing.subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-300">
          <span>Taxes & Fees (18%)</span>
          <span>{formatPrice(pricing.taxes)}</span>
        </div>
        
        <hr className="border-gray-600" />
        
        <div className="flex justify-between text-white font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(pricing.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingDisplay;
