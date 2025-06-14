import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';

const CompanyRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    description: '',
    experience: '',
    hasMechanic: false,
    services: [] as string[],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    lat: 0,
    lng: 0
  });

  const availableServices = [
    'Basic Wash',
    'Premium Wash',
    'Full Detail',
    'Interior Cleaning',
    'Exterior Wash',
    'Wax & Polish',
    'Engine Cleaning',
    'Tire Service'
  ];

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authFormData.password !== authFormData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (authFormData.password.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (authFormData.phone && authFormData.phone.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be 10 digits",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      email: authFormData.email,
      phone: authFormData.phone 
    }));
    setStep(2);
  };

  const handleLocationSelect = (selectedLocation: { 
    lat: number; 
    lng: number; 
    address: string; 
    city: string; 
    zipCode: string; 
  }) => {
    setFormData(prev => ({
      ...prev,
      address: selectedLocation.address,
      city: selectedLocation.city,
      zipCode: selectedLocation.zipCode,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting company registration process...');
      
      if (formData.services.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one service",
          variant: "destructive"
        });
        return;
      }
      
      // First create the user account with phone number
      const userData = {
        full_name: formData.ownerName,
        role: 'provider',
        ...(authFormData.phone && { phone: authFormData.phone })
      };

      const { data: authResult, error: authError } = await signUp(
        formData.email, 
        authFormData.password, 
        userData
      );

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Registration Failed",
          description: authError.message || "Failed to create account",
          variant: "destructive"
        });
        return;
      }

      if (!authResult?.user) {
        toast({
          title: "Registration Failed", 
          description: "Failed to create user account",
          variant: "destructive"
        });
        return;
      }

      console.log('User account created successfully, now registering company...');

      // Register the company with phone number
      const { data: functionData, error: functionError } = await supabase.functions.invoke('register-company', {
        body: {
          company_name: formData.companyName,
          owner_name: formData.ownerName,
          email: formData.email,
          phone: authFormData.phone || formData.phone,
          description: formData.description,
          experience: formData.experience,
          has_mechanic: formData.hasMechanic,
          services: formData.services,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          latitude: formData.lat,
          longitude: formData.lng,
          user_id: authResult.user.id
        }
      });

      if (functionError) {
        console.error('Company registration error:', functionError);
        toast({
          title: "Registration Failed",
          description: functionError.message || "Failed to register company",
          variant: "destructive"
        });
        return;
      }

      console.log('Company registration successful:', functionData);
      
      toast({
        title: "Success!",
        description: "Company registered successfully! You can now log in and start receiving booking requests.",
      });

      // Redirect to company dashboard
      navigate('/company-dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Step 1: Set up your login credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={authFormData.email}
                    onChange={(e) => setAuthFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Phone Number (Optional - for password recovery)</label>
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 border border-r-0 border-gray-200 rounded-l-md bg-gray-50">
                      <span className="text-sm font-medium">🇮🇳 +91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="10-digit phone number"
                      value={authFormData.phone}
                      onChange={(e) => setAuthFormData(prev => ({ 
                        ...prev, 
                        phone: e.target.value.replace(/\D/g, '').slice(0, 10) 
                      }))}
                      className="rounded-l-none"
                      maxLength={10}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Adding a phone number allows you to reset your password using SMS
                  </p>
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={authFormData.password}
                    onChange={(e) => setAuthFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={authFormData.confirmPassword}
                    onChange={(e) => setAuthFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Continue to Company Details'}
                </Button>

                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={() => navigate('/mechanic-signup')}
                    className="text-sm"
                  >
                    Register as Individual Mechanic Instead
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Register Your Washing Company</CardTitle>
            <CardDescription className="text-center">
              Step 2: Complete your company profile to start receiving bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your Company Name"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Owner Name *</label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Owner's Full Name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your Phone Number"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AP">Andhra Pradesh</SelectItem>
                      <SelectItem value="AR">Arunachal Pradesh</SelectItem>
                      <SelectItem value="AS">Assam</SelectItem>
                      <SelectItem value="BR">Bihar</SelectItem>
                      <SelectItem value="CT">Chhattisgarh</SelectItem>
                      <SelectItem value="GA">Goa</SelectItem>
                      <SelectItem value="GJ">Gujarat</SelectItem>
                      <SelectItem value="HR">Haryana</SelectItem>
                      <SelectItem value="HP">Himachal Pradesh</SelectItem>
                      <SelectItem value="JH">Jharkhand</SelectItem>
                      <SelectItem value="KA">Karnataka</SelectItem>
                      <SelectItem value="KL">Kerala</SelectItem>
                      <SelectItem value="MP">Madhya Pradesh</SelectItem>
                      <SelectItem value="MH">Maharashtra</SelectItem>
                      <SelectItem value="MN">Manipur</SelectItem>
                      <SelectItem value="ML">Meghalaya</SelectItem>
                      <SelectItem value="MZ">Mizoram</SelectItem>
                      <SelectItem value="NL">Nagaland</SelectItem>
                      <SelectItem value="OR">Odisha</SelectItem>
                      <SelectItem value="PB">Punjab</SelectItem>
                      <SelectItem value="RJ">Rajasthan</SelectItem>
                      <SelectItem value="SK">Sikkim</SelectItem>
                      <SelectItem value="TN">Tamil Nadu</SelectItem>
                      <SelectItem value="TG">Telangana</SelectItem>
                      <SelectItem value="TR">Tripura</SelectItem>
                      <SelectItem value="UP">Uttar Pradesh</SelectItem>
                      <SelectItem value="UT">Uttarakhand</SelectItem>
                      <SelectItem value="WB">West Bengal</SelectItem>
                      <SelectItem value="AN">Andaman and Nicobar Islands</SelectItem>
                      <SelectItem value="CH">Chandigarh</SelectItem>
                      <SelectItem value="DN">Dadra and Nagar Haveli</SelectItem>
                      <SelectItem value="DD">Daman and Diu</SelectItem>
                      <SelectItem value="DL">Delhi</SelectItem>
                      <SelectItem value="JK">Jammu and Kashmir</SelectItem>
                      <SelectItem value="LA">Ladakh</SelectItem>
                      <SelectItem value="LD">Lakshadweep</SelectItem>
                      <SelectItem value="PY">Puducherry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Address *</label>
                <EnhancedLocationSelector
                  onLocationSelect={handleLocationSelect}
                />
                {formData.address && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <strong>Selected:</strong> {formData.address}, {formData.city} - {formData.zipCode}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Services Offered *</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.services.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <label htmlFor={service} className="text-sm font-medium">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your company, services offered, and what makes you unique..."
                  rows={4}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMechanic"
                  checked={formData.hasMechanic}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasMechanic: checked as boolean }))
                  }
                />
                <label htmlFor="hasMechanic" className="text-sm font-medium">
                  We also provide vehicle mechanic services
                </label>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !formData.address || formData.services.length === 0}
                  className="flex-1"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyRegistration;
