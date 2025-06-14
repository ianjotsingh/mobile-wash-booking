
interface ServicePricing {
  id: string;
  basePrice: number;
  taxRate: number;
  discountRate?: number;
}

// Remove hardcoded pricing - companies will set their own prices
export interface PricingBreakdown {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  discount: number;
  subtotal: number;
  taxes: number;
  total: number;
}

export const calculateServicePrice = (
  basePrice: number,
  serviceId: string,
  promoCode?: string
): PricingBreakdown => {
  const taxRate = 0.18; // 18% GST
  let discountRate = 0;
  
  // Apply promo code discounts
  if (promoCode) {
    switch (promoCode.toUpperCase()) {
      case 'FIRST20':
        discountRate = 0.20;
        break;
      case 'WASH10':
        discountRate = 0.10;
        break;
      case 'MECHANIC15':
        discountRate = 0.15;
        break;
    }
  }

  const discount = Math.floor(basePrice * discountRate);
  const subtotal = basePrice - discount;
  const taxes = Math.floor(subtotal * taxRate);
  const total = subtotal + taxes;

  return {
    serviceId,
    serviceName: serviceId,
    basePrice,
    discount,
    subtotal,
    taxes,
    total,
  };
};

export const formatPrice = (priceInPaise: number): string => {
  return `₹${(priceInPaise / 100).toFixed(0)}`;
};
