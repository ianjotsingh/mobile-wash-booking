
interface ServicePricing {
  id: string;
  basePrice: number;
  taxRate: number;
  discountRate?: number;
}

const CAR_WASH_PRICING: Record<string, ServicePricing> = {
  'basic-wash': {
    id: 'basic-wash',
    basePrice: 19900, // ₹199 in paise
    taxRate: 0.18, // 18% GST
  },
  'premium-wash': {
    id: 'premium-wash',
    basePrice: 39900, // ₹399 in paise
    taxRate: 0.18,
    discountRate: 0.10, // 10% discount for popular service
  },
  'full-detailing': {
    id: 'full-detailing',
    basePrice: 79900, // ₹799 in paise
    taxRate: 0.18,
  },
  'interior-only': {
    id: 'interior-only',
    basePrice: 29900, // ₹299 in paise
    taxRate: 0.18,
  },
};

const MECHANIC_PRICING: Record<string, ServicePricing> = {
  'emergency-roadside': {
    id: 'emergency-roadside',
    basePrice: 29900, // ₹299 base price
    taxRate: 0.18,
  },
  'engine-diagnostics': {
    id: 'engine-diagnostics',
    basePrice: 49900, // ₹499
    taxRate: 0.18,
  },
  'tire-services': {
    id: 'tire-services',
    basePrice: 19900, // ₹199 minimum
    taxRate: 0.18,
  },
  'battery-services': {
    id: 'battery-services',
    basePrice: 29900, // ₹299 minimum
    taxRate: 0.18,
  },
  'oil-change': {
    id: 'oil-change',
    basePrice: 69900, // ₹699
    taxRate: 0.18,
  },
  'ac-repair': {
    id: 'ac-repair',
    basePrice: 79900, // ₹799
    taxRate: 0.18,
  },
};

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
  serviceId: string,
  category: 'wash' | 'mechanic',
  promoCode?: string
): PricingBreakdown => {
  const pricingData = category === 'wash' ? CAR_WASH_PRICING : MECHANIC_PRICING;
  const service = pricingData[serviceId];
  
  if (!service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  const basePrice = service.basePrice;
  let discountRate = service.discountRate || 0;
  
  // Apply promo code discounts
  if (promoCode) {
    switch (promoCode.toUpperCase()) {
      case 'FIRST20':
        discountRate = Math.max(discountRate, 0.20);
        break;
      case 'WASH10':
        if (category === 'wash') discountRate = Math.max(discountRate, 0.10);
        break;
      case 'MECHANIC15':
        if (category === 'mechanic') discountRate = Math.max(discountRate, 0.15);
        break;
    }
  }

  const discount = Math.floor(basePrice * discountRate);
  const subtotal = basePrice - discount;
  const taxes = Math.floor(subtotal * service.taxRate);
  const total = subtotal + taxes;

  return {
    serviceId,
    serviceName: service.id,
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
