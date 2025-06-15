import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ServiceOnboarding from './ServiceOnboarding';
import { MapPin, Car, Wrench, Clock, Star } from 'lucide-react';

interface ServicePricing {
  service: string;
  price: number;
}

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
  const [experience, setExperience] = useState('');
  const [hasMechanic, setHasMechanic] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePricing, setServicePricing] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Helper to detect if running as mobile app
  const isMobileApp = typeof window !== "undefined" && window.location.search.includes('mobile=true');

  // Poll for updated role after registration
  const waitForCompanyRole = async (userId: string, retries = 15, delay = 400) => {
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

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        // Remove service and its pricing
        setServicePricing(prevPricing => prevPricing.filter(p => p.service !== service));
        return prev.filter(s => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!companyName || !ownerName || !contactEmail || !contactPhone) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }
    } else if (step === 2) {
      if (!address || !city || !zipCode) {
        toast({
          title: 'Error',
          description: 'Please fill in all address fields.',
          variant: 'destructive',
        });
        return;
      }
    } else if (step === 3) {
      if (selectedServices.length === 0) {
        toast({
          title: 'Error',
          description: 'Please select at least one service.',
          variant: 'destructive',
        });
        return;
      }
      const missingPrices = selectedServices.filter(service => 
        !servicePricing.find(p => p.service === service && p.price > 0)
      );
      if (missingPrices.length > 0) {
        toast({
          title: 'Error',
          description: 'Please set prices for all selected services.',
          variant: 'destructive',
        });
        return;
      }
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
        console.error('Company registration error:', companyError);
        toast({
          title: 'Error',
          description: 'Failed to register company. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
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

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          type="text"
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="ownerName">Owner Name *</Label>
        <Input
          type="text"
          id="ownerName"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="companyType">Company Type</Label>
        <Select onValueChange={setCompanyType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
            <SelectItem value="Partnership">Partnership</SelectItem>
            <SelectItem value="Private Limited Company">Private Limited Company</SelectItem>
            <SelectItem value="Public Limited Company">Public Limited Company</SelectItem>
            <SelectItem value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact Email *</Label>
        <Input
          type="email"
          id="contactEmail"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="contactPhone">Contact Phone *</Label>
        <Input
          type="tel"
          id="contactPhone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Full Address *</Label>
        <Input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address, building number"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="zipCode">ZIP Code *</Label>
        <Input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="experience">Years of Experience</Label>
        <Select onValueChange={setExperience}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-1">0-1 years</SelectItem>
            <SelectItem value="1-3">1-3 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="5-10">5-10 years</SelectItem>
            <SelectItem value="10+">10+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasMechanic"
          checked={hasMechanic}
          onCheckedChange={(checked) => setHasMechanic(checked === true)}
        />
        <Label htmlFor="hasMechanic">We provide mechanic services</Label>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <ServiceOnboarding
      selectedServices={selectedServices}
      onServicesChange={setSelectedServices}
      onPricingChange={setServicePricing}
    />
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="companyDescription">Company Description</Label>
        <Textarea
          id="companyDescription"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          rows={4}
          placeholder="Tell customers about your company, specializations, and what makes you unique..."
        />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Registration Summary</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p><strong>Company:</strong> {companyName}</p>
          <p><strong>Owner:</strong> {ownerName}</p>
          <p><strong>Location:</strong> {city}, {state}</p>
          <p><strong>Services:</strong> {selectedServices.length} selected</p>
          <p><strong>Experience:</strong> {experience || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Company Registration</h1>
            <span className="text-sm text-gray-600">Step {step} of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Basic Information"}
                  {step === 2 && "Business Location"}
                  {step === 3 && "Services & Pricing"}
                  {step === 4 && "Final Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

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

          {/* Benefits Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Why Join Us?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Local Customer Base</p>
                    <p className="text-sm text-gray-600">Connect with customers in your area</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Flexible Schedule</p>
                    <p className="text-sm text-gray-600">Work on your own terms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Grow Your Business</p>
                    <p className="text-sm text-gray-600">Expand your service offerings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
