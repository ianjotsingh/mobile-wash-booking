
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ServiceOnboarding from './ServiceOnboarding';
import BasicInfoStep from './registration/BasicInfoStep';
import LocationStep from './registration/LocationStep';
import FinalDetailsStep from './registration/FinalDetailsStep';
import BenefitsSidebar from './registration/BenefitsSidebar';
import ProgressBar from './registration/ProgressBar';
import { 
  ServicePricing, 
  waitForCompanyRole, 
  submitCompanyRegistration, 
  validateStep 
} from '@/utils/registrationUtils';

const CompanyRegistration = () => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [experience, setExperience] = useState('');
  const [hasMechanic, setHasMechanic] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePricing, setServicePricing] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper to detect if running as mobile app
  const isMobileApp = typeof window !== "undefined" && window.location.search.includes('mobile=true');

  const handleNextStep = () => {
    const validation = validateStep(step, {
      companyName,
      ownerName,
      contactEmail,
      contactPhone,
      address,
      city,
      zipCode,
      selectedServices,
      servicePricing
    });

    if (!validation.isValid) {
      toast({
        title: 'Error',
        description: validation.message,
        variant: 'destructive',
      });
      return;
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to register a company.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      await submitCompanyRegistration({
        user,
        companyName,
        ownerName,
        contactEmail,
        contactPhone,
        address,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        companyDescription,
        experience,
        hasMechanic,
        selectedServices,
        servicePricing
      });

      toast({
        title: 'Almost done...',
        description: 'Finalizing your registration (this can take a few seconds)...',
        variant: 'default',
        duration: 4000,
      });

      // Wait for role to become "company" before redirecting
      const success = await waitForCompanyRole(user.id);

      if (success) {
        if (isMobileApp) {
          window.location.href = "/company/dashboard";
        } else {
          window.location.href = "/company-dashboard";
        }
      } else {
        toast({
          title: 'Notice',
          description: 'Company registered but could not verify your role. Please refresh or login again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Company registration error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Basic Information";
      case 2: return "Business Location";
      case 3: return "Services & Pricing";
      case 4: return "Final Details";
      default: return "";
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <BasicInfoStep
            companyName={companyName}
            setCompanyName={setCompanyName}
            ownerName={ownerName}
            setOwnerName={setOwnerName}
            companyType={companyType}
            setCompanyType={setCompanyType}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
          />
        );
      case 2:
        return (
          <LocationStep
            address={address}
            setAddress={setAddress}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
            zipCode={zipCode}
            setZipCode={setZipCode}
            experience={experience}
            setExperience={setExperience}
            hasMechanic={hasMechanic}
            setHasMechanic={setHasMechanic}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
          />
        );
      case 3:
        return (
          <ServiceOnboarding
            selectedServices={selectedServices}
            onServicesChange={setSelectedServices}
            onPricingChange={setServicePricing}
          />
        );
      case 4:
        return (
          <FinalDetailsStep
            companyDescription={companyDescription}
            setCompanyDescription={setCompanyDescription}
            companyName={companyName}
            ownerName={ownerName}
            city={city}
            state={state}
            selectedServices={selectedServices}
            experience={experience}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <ProgressBar currentStep={step} totalSteps={4} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{getStepTitle()}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderCurrentStep()}

                <div className="flex justify-between mt-6 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>
                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Registering...' : 'Complete Registration'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <BenefitsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
