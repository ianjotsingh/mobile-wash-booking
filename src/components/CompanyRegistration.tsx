import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ServiceOnboarding from './ServiceOnboarding';
import BenefitsSidebar from './registration/BenefitsSidebar';
import { ServicePricing, waitForCompanyRole, submitCompanyRegistration } from '@/utils/registrationUtils';
import { getCurrentLocation } from '@/utils/locationService';

const CompanyRegistration = () => {
  // Basic Info state
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Location state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  // Service state
  const [experience, setExperience] = useState('');
  const [hasMechanic, setHasMechanic] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePricing, setServicePricing] = useState<ServicePricing[]>([]);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper to detect if running as mobile app
  const isMobileApp = typeof window !== "undefined" && window.location.search.includes('mobile=true');

  // VALIDATION for one-page form
  const validateForm = () => {
    if (!companyName || !ownerName || !contactEmail || !contactPhone) {
      return "Please fill in all required basic info fields.";
    }
    if (!address || !city) {
      return "Address and city are required.";
    }
    if (!selectedServices.length || !servicePricing.length) {
      return "Please select at least one service and set pricing.";
    }
    // Ensure at least one selected service has a non-zero price
    if (!servicePricing.some(sp => sp.isAvailable && sp.basePrice > 0)) {
      return "Please add pricing for at least one selected service.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to register a company.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

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

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      setAddress(location.address || '');
      setCity(location.city || '');
      setState(location.state || '');
      setZipCode(location.zipCode || '');
      setLatitude(location.latitude);
      setLongitude(location.longitude);

      toast({
        title: "Location detected",
        description: "Your location fields were filled automatically.",
      });
    } catch (error: any) {
      toast({
        title: "Location Error",
        description: error.message || "Unable to detect your location. Please fill the fields manually.",
        variant: "destructive"
      });
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Company Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* --- BASIC INFO --- */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div>
                      <label className="block font-medium mb-1" htmlFor="companyName">Company Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        id="companyName"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1" htmlFor="ownerName">Owner Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        id="ownerName"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1" htmlFor="companyType">Company Type</label>
                      <select
                        className="w-full border rounded p-2"
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                        id="companyType"
                      >
                        <option value="">Select a type</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                        <option value="Public Limited Company">Public Limited Company</option>
                        <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1" htmlFor="contactEmail">Contact Email *</label>
                      <input
                        type="email"
                        className="w-full border rounded p-2"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        id="contactEmail"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1" htmlFor="contactPhone">Contact Phone *</label>
                      <input
                        type="tel"
                        className="w-full border rounded p-2"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        id="contactPhone"
                        required
                      />
                    </div>
                  </div>
                  {/* --- LOCATION --- */}
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center justify-between">
                      Business Location
                      <button
                        type="button"
                        className="ml-2 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow disabled:opacity-50 transition-all flex items-center gap-2"
                        onClick={handleUseCurrentLocation}
                        disabled={locationLoading}
                      >
                        {locationLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="white" strokeWidth="2" opacity="0.25"/><path d="M15 8A7 7 0 1 0 8 15" stroke="white" strokeWidth="2"/></svg>
                            Locating...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M22 12h-4M6.28 17.2l-2.86 2.86M2 12h4M17.71 6.29l2.86-2.86" /></svg>
                            Use Current Location
                          </>
                        )}
                      </button>
                    </h3>
                    <div>
                      <label className="block font-medium mb-1" htmlFor="address">Address *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        id="address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1" htmlFor="city">City *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        id="city"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-1" htmlFor="state">State</label>
                        <input
                          type="text"
                          className="w-full border rounded p-2"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          id="state"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1" htmlFor="zipCode">ZIP Code</label>
                        <input
                          type="text"
                          className="w-full border rounded p-2"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          id="zipCode"
                        />
                      </div>
                    </div>
                    {/* Optional: show coordinates if available */}
                    {(latitude && longitude) && (
                      <div className="mt-2 text-xs text-emerald-700">
                        Detected coordinates: <span className="font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                      </div>
                    )}
                    <div>
                      <label className="block font-medium mb-1" htmlFor="experience">Experience (years)</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        id="experience"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  {/* --- SERVICES & PRICING --- */}
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold">Services &amp; Pricing *</h3>
                    <ServiceOnboarding
                      selectedServices={selectedServices}
                      onServicesChange={setSelectedServices}
                      onPricingChange={setServicePricing}
                    />
                  </div>
                  {/* --- SUBMIT --- */}
                  <div className="mt-8 pt-6 border-t flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? 'Registering...' : 'Complete Registration'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Sidebar */}
            <div>
              <BenefitsSidebar />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;
