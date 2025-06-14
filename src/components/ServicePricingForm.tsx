
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ServicePricing {
  service: string;
  price: number;
}

interface ServicePricingFormProps {
  selectedServices: string[];
  servicePricing: ServicePricing[];
  onPricingChange: (pricing: ServicePricing[]) => void;
}

const ServicePricingForm: React.FC<ServicePricingFormProps> = ({
  selectedServices,
  servicePricing,
  onPricingChange
}) => {
  const updatePrice = (service: string, price: number) => {
    const updatedPricing = servicePricing.filter(p => p.service !== service);
    updatedPricing.push({ service, price });
    onPricingChange(updatedPricing);
  };

  const getPrice = (service: string) => {
    const pricing = servicePricing.find(p => p.service === service);
    return pricing ? pricing.price : 0;
  };

  if (selectedServices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Set Prices for Your Services</Label>
      <p className="text-sm text-gray-600">Enter the base price for each service you offer (in ₹)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedServices.map((service) => (
          <div key={service} className="space-y-2">
            <Label htmlFor={`price-${service}`} className="text-sm font-medium">
              {service}
            </Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">₹</span>
              <Input
                id={`price-${service}`}
                type="number"
                placeholder="Enter price"
                value={getPrice(service) || ''}
                onChange={(e) => updatePrice(service, parseInt(e.target.value) || 0)}
                min="0"
                className="flex-1"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicePricingForm;
