
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Wrench, MapPin, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import OtpVerification from './OtpVerification';

const mechanicRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  aadhaar_number: z.string().min(12, 'Aadhaar number must be 12 digits').max(12, 'Aadhaar number must be 12 digits').regex(/^\d+$/, 'Aadhaar number must contain only digits'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your complete address'),
  city: z.string().min(2, 'Please enter your city'),
  zip_code: z.string().min(5, 'Please enter a valid zip code'),
  experience: z.string().min(1, 'Please specify your experience'),
  availability_hours: z.string().min(1, 'Please specify your availability'),
  specializations: z.array(z.string()).min(1, 'Please select at least one specialization'),
});

type MechanicRegistrationForm = z.infer<typeof mechanicRegistrationSchema>;

const MechanicRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState<MechanicRegistrationForm | null>(null);
  const { toast } = useToast();
  const { signUpWithPhone } = useAuth();

  const availableSpecializations = [
    'Engine Repair',
    'Brake Systems',
    'Transmission',
    'Electrical Systems',
    'Air Conditioning',
    'Suspension',
    'Oil Changes',
    'Tire Services',
    'Battery Replacement',
    'General Maintenance'
  ];

  const form = useForm<MechanicRegistrationForm>({
    resolver: zodResolver(mechanicRegistrationSchema),
    defaultValues: {
      full_name: '',
      aadhaar_number: '',
      phone: '',
      address: '',
      city: '',
      zip_code: '',
      experience: '',
      availability_hours: '',
      specializations: [],
    },
  });

  const onSubmit = async (data: MechanicRegistrationForm) => {
    setIsSubmitting(true);
    try {
      console.log('Initiating phone auth for mechanic registration:', data);

      // Format phone number (ensure it starts with +91 for India)
      const formattedPhone = data.phone.startsWith('+91') ? data.phone : `+91${data.phone}`;
      
      // Send OTP to phone number
      const { error } = await signUpWithPhone(formattedPhone, {
        full_name: data.full_name,
        role: 'mechanic'
      });

      if (error) {
        console.error('Phone auth error:', error);
        throw error;
      }

      // Store form data for later use after OTP verification
      setFormData(data);
      setPhoneNumber(formattedPhone);
      setShowOtpVerification(true);

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${formattedPhone}`,
      });

    } catch (error: any) {
      console.error('Error initiating phone auth:', error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "There was an error sending the OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSuccess = async () => {
    if (!formData) return;

    setIsSubmitting(true);
    try {
      console.log('Completing mechanic registration after OTP verification');

      // Wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User authentication failed');
      }

      // Structure the data to match the database schema
      const mechanicData = {
        user_id: user.id,
        full_name: formData.full_name,
        email: user.email || '', // This will be empty for phone auth
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip_code,
        experience: formData.experience,
        description: `Aadhaar: ${formData.aadhaar_number}`,
        hourly_rate: 50000,
        availability_hours: formData.availability_hours,
        specializations: formData.specializations,
        status: 'pending'
      };

      const { error } = await supabase
        .from('mechanics')
        .insert(mechanicData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Registration completed successfully!",
        description: "Your mechanic registration is under review. We'll contact you soon. You are now logged in.",
      });

      form.reset();
      setShowOtpVerification(false);
      setFormData(null);
    } catch (error: any) {
      console.error('Error completing registration:', error);
      toast({
        title: "Registration failed",
        description: error.message || "There was an error completing your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setShowOtpVerification(false);
    setFormData(null);
  };

  if (showOtpVerification) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <OtpVerification
          phoneNumber={phoneNumber}
          onVerificationSuccess={handleVerificationSuccess}
          onBack={handleBackToForm}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-6 w-6 text-emerald-600" />
            <span>Mechanic Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10-digit phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aadhaar_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhaar Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="12-digit Aadhaar number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Complete street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ZIP Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Professional Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability Hours</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 9 AM - 6 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Specializations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Specializations</h3>
                <FormField
                  control={form.control}
                  name="specializations"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableSpecializations.map((specialization) => (
                          <FormField
                            key={specialization}
                            control={form.control}
                            name="specializations"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={specialization}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(specialization)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, specialization])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== specialization
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {specialization}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending OTP...' : 'Send OTP to Register'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MechanicRegistration;
