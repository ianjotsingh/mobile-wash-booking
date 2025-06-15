
import { supabase } from '@/integrations/supabase/client';

export interface ServicePricing {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  isAvailable: boolean;
}

interface CompanyRegistrationData {
  user: any;
  companyName: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  companyDescription: string;
  experience: string;
  hasMechanic: boolean;
  selectedServices: string[];
  servicePricing: ServicePricing[];
}

export const submitCompanyRegistration = async (data: CompanyRegistrationData) => {
  const { user, companyName, ownerName, contactEmail, contactPhone, address, city, state, zipCode, latitude, longitude, companyDescription, experience, hasMechanic, selectedServices, servicePricing } = data;

  // Insert company data
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .insert([
      {
        user_id: user.id,
        company_name: companyName,
        owner_name: ownerName,
        email: contactEmail,
        phone: contactPhone,
        address,
        city,
        state,
        zip_code: zipCode,
        latitude,
        longitude,
        description: companyDescription,
        experience,
        has_mechanic: hasMechanic,
        services: selectedServices,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (companyError) throw companyError;

  // Insert service pricing
  if (servicePricing.length > 0) {
    const pricingData = servicePricing.map(pricing => ({
      company_id: companyData.id,
      service_id: pricing.serviceId,
      service_name: pricing.serviceName,
      base_price: pricing.basePrice * 100, // Convert to paise
      is_available: pricing.isAvailable
    }));

    const { error: pricingError } = await supabase
      .from('company_service_pricing')
      .insert(pricingData);

    if (pricingError) throw pricingError;
  }

  // Update user role to company
  const { error: roleError } = await supabase
    .from('user_profiles')
    .update({ role: 'company' })
    .eq('user_id', user.id);

  if (roleError) throw roleError;

  return companyData;
};

export const waitForCompanyRole = async (userId: string): Promise<boolean> => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data?.role === 'company') {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  return false;
};

export const validateStep = (step: number, formData: any) => {
  switch (step) {
    case 1:
      if (!formData.companyName || !formData.ownerName || !formData.contactEmail || !formData.contactPhone) {
        return {
          isValid: false,
          message: 'Please fill in all required fields in Basic Information.'
        };
      }
      break;
    case 2:
      if (!formData.address || !formData.city || !formData.zipCode) {
        return {
          isValid: false,
          message: 'Please fill in all required location fields.'
        };
      }
      break;
    case 3:
      if (!formData.selectedServices || formData.selectedServices.length === 0) {
        return {
          isValid: false,
          message: 'Please select at least one service.'
        };
      }
      if (!formData.servicePricing || formData.servicePricing.length === 0) {
        return {
          isValid: false,
          message: 'Please set pricing for your services.'
        };
      }
      break;
  }
  
  return { isValid: true, message: '' };
};
