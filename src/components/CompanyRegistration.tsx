
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

  // VALIDATION for comprehensive form
  const validateForm = () => {
    // Basic Information Validation
    if (!companyName.trim()) {
      return "Company name is required.";
    }
    if (!ownerName.trim()) {
      return "Owner name is required.";
    }
    if (!contactEmail.trim()) {
      return "Contact email is required.";
    }
    if (!contactPhone.trim()) {
      return "Mobile number is required.";
    }
    
    // Location Validation
    if (!address.trim() || !city.trim()) {
      return "Complete address and city are required.";
    }
    
    // Services Validation
    if (!selectedServices.length) {
      return "Please select at least one service you provide.";
    }
    if (!servicePricing.length || !servicePricing.some(sp => sp.isAvailable && sp.basePrice > 0)) {
      return "Please set pricing for at least one service.";
    }
    
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      toast({
        title: 'Validation Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
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
        title: 'Registration Submitted',
        description: 'Your company registration is being processed. This may take a few moments...',
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
          title: 'Registration Complete',
          description: 'Company registered successfully. Please refresh the page to access your dashboard.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Company registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'An error occurred during registration. Please try again.',
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
        title: "Location Detected",
        description: "Your location has been automatically filled in the form.",
      });
    } catch (error: any) {
      toast({
        title: "Location Detection Failed",
        description: error.message || "Unable to detect your location. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Service Company</h1>
            <p className="text-gray-600">Join our platform and start receiving service requests from customers</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Registration Form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Company Information Card */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="companyName">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your company name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="ownerName">
                          Owner/Manager Name *
                        </label>
                        <input
                          type="text"
                          id="ownerName"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your full name"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="companyType">
                        Business Type
                      </label>
                      <select
                        id="companyType"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                      >
                        <option value="">Select business type</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                        <option value="Public Limited Company">Public Limited Company</option>
                        <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="companyDescription">
                        Company Description
                      </label>
                      <textarea
                        id="companyDescription"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your company and services..."
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information Card */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contactEmail">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          id="contactEmail"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="business@company.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contactPhone">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          id="contactPhone"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="+91 9876543210"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Location Card */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="text-xl text-purple-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Business Location
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseCurrentLocation}
                        disabled={locationLoading}
                        className="bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200"
                      >
                        {locationLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                              <path d="M15 8A7 7 0 1 0 8 15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Detecting...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M22 12h-4M6.28 17.2l-2.86 2.86M2 12h4M17.71 6.29l2.86-2.86" />
                            </svg>
                            Use Current Location
                          </>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="address">
                        Complete Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Street address, building number, area"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="city">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="state">
                          State
                        </label>
                        <input
                          type="text"
                          id="state"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="zipCode">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="PIN Code"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                        />
                      </div>
                    </div>

                    {(latitude && longitude) && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-700 font-medium">
                          📍 Location Coordinates: <span className="font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="experience">
                        Years of Experience
                      </label>
                      <select
                        id="experience"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      >
                        <option value="">Select experience level</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Services & Pricing Card */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="text-xl text-orange-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Services & Pricing *
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">
                        Select the services you provide and set your pricing. This will help customers find and book your services.
                      </p>
                    </div>
                    <ServiceOnboarding
                      selectedServices={selectedServices}
                      onServicesChange={setSelectedServices}
                      onPricingChange={setServicePricing}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                          <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" strokeWidth="4"/>
                        </svg>
                        Registering Company...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                </div>
              </div>

              {/* Benefits Sidebar */}
              <div className="lg:col-span-1">
                <BenefitsSidebar />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
