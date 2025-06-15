
import { supabase } from '@/integrations/supabase/client';

export interface ServicePricing {
  service: string;
  price: number;
}

export const waitForCompanyRole = async (userId: string, retries = 15, delay = 400): Promise<boolean> => {
  const { fetchUserRole } = await import('@/hooks/useRoleFetcher');
  for (let i = 0; i < retries; i++) {
    const currentRole = await fetchUserRole(userId);
    if (currentRole === 'company') {
      return true;
    }
    await new Promise(res => setTimeout(res, delay));
  }
  return false;
};

export const submitCompanyRegistration = async (data: {
  user: any;
  companyName: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  companyDescription: string;
  experience: string;
  hasMechanic: boolean;
  selectedServices: string[];
  servicePricing: ServicePricing[];
}) => {
  const {
    user,
    companyName,
    ownerName,
    contactEmail,
    contactPhone,
    address,
    city,
    state,
    zipCode,
    companyDescription,
    experience,
    hasMechanic,
    selectedServices,
    servicePricing
  } = data;

  // Insert company data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert([
      {
        user_id: user.id,
        company_name: companyName,
        owner_name: ownerName,
        email: contactEmail,
        phone: contactPhone,
        address: address,
        city: city,
        state: state,
        zip_code: zipCode,
        description: companyDescription,
        experience: experience,
        has_mechanic: hasMechanic,
        services: selectedServices,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (companyError) {
    throw companyError;
  }

  // Insert service pricing
  if (servicePricing.length > 0) {
    const pricingData = servicePricing.map(pricing => ({
      company_id: company.id,
      service_id: pricing.service.toLowerCase().replace(/\s+/g, '-'),
      service_name: pricing.service,
      base_price: pricing.price * 100, // Convert to paise
    }));

    const { error: pricingError } = await supabase
      .from('company_service_pricing')
      .insert(pricingData);

    if (pricingError) {
      console.error('Pricing insertion error:', pricingError);
      // Don't block registration for pricing errors
    }
  }

  return company;
};

export const validateStep = (step: number, data: any): { isValid: boolean; message?: string } => {
  switch (step) {
    case 1:
      if (!data.companyName || !data.ownerName || !data.contactEmail || !data.contactPhone) {
        return { isValid: false, message: 'Please fill in all required fields.' };
      }
      break;
    case 2:
      if (!data.address || !data.city || !data.zipCode) {
        return { isValid: false, message: 'Please fill in all address fields.' };
      }
      break;
    case 3:
      if (data.selectedServices.length === 0) {
        return { isValid: false, message: 'Please select at least one service.' };
      }
      const missingPrices = data.selectedServices.filter((service: string) => 
        !data.servicePricing.find((p: ServicePricing) => p.service === service && p.price > 0)
      );
      if (missingPrices.length > 0) {
        return { isValid: false, message: 'Please set prices for all selected services.' };
      }
      break;
  }
  return { isValid: true };
};
