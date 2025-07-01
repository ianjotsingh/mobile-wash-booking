
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Wrench, MapPin, Phone, User, Upload, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mechanicRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your complete address'),
  city: z.string().min(2, 'Please enter your city'),
  zip_code: z.string().min(5, 'Please enter a valid zip code'),
  experience: z.string().min(1, 'Please specify your experience in years'),
  specializations: z.array(z.string()).min(1, 'Please select at least one service'),
  aadhaar_document: z.any().refine((file) => file instanceof File, 'Please upload your Aadhaar card'),
});

type MechanicRegistrationForm = z.infer<typeof mechanicRegistrationSchema>;

const MechanicRegistrationPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const availableServices = [
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
      phone: '',
      address: '',
      city: '',
      zip_code: '',
      experience: '',
      specializations: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      form.setValue('aadhaar_document', file);
    }
  };

  const onSubmit = async (data: MechanicRegistrationForm) => {
    setIsSubmitting(true);
    try {
      console.log('Starting mechanic registration:', data);

      // Create a temporary email from phone number for auth
      const tempEmail = `${data.phone}@mechanic.temp`;
      const tempPassword = `temp${data.phone}123`;

      // Sign up the user
      const { data: authData, error: authError } = await signUp(tempEmail, tempPassword, {
        full_name: data.full_name,
        role: 'mechanic',
        phone: data.phone
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('User registration failed');
      }

      // Upload the Aadhaar document if provided
      let documentUrl = '';
      if (documentFile) {
        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('mechanic_documents')
          .upload(fileName, documentFile);

        if (uploadError) {
          console.error('Document upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('mechanic_documents')
            .getPublicUrl(fileName);
          documentUrl = publicUrl;
        }
      }

      // Insert mechanic data
      const mechanicData = {
        user_id: authData.user.id,
        full_name: data.full_name,
        email: tempEmail,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zip_code: data.zip_code,
        experience: `${data.experience} years`,
        description: documentUrl ? `Aadhaar: ${documentUrl}` : 'Document pending upload',
        hourly_rate: 50000,
        specializations: data.specializations,
        status: 'approved' // Auto-approve for demo
      };

      const { error: insertError } = await supabase
        .from('mechanics')
        .insert(mechanicData);

      if (insertError) {
        console.error('Supabase error:', insertError);
        throw insertError;
      }

      toast({
        title: "Registration completed successfully!",
        description: "Welcome to WashCart! Redirecting to your dashboard...",
      });

      // Navigate to mechanic dashboard
      setTimeout(() => {
        navigate('/mechanic-dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Wrench className="h-6 w-6 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Mechanic Registration</h1>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Join as a Mechanic</CardTitle>
            <p className="text-center text-gray-600">Fill in your details to start offering services</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
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
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="flex items-center px-3 py-2 border border-r-0 border-gray-200 rounded-l-md bg-gray-50">
                              <span className="text-sm font-medium">🇮🇳 +91</span>
                            </div>
                            <Input 
                              placeholder="10-digit phone number" 
                              {...field}
                              className="rounded-l-none"
                              maxLength={10}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Location</span>
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complete Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
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
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="PIN Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Experience */}
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Services */}
                <FormField
                  control={form.control}
                  name="specializations"
                  render={() => (
                    <FormItem>
                      <FormLabel>Services You Provide *</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {availableServices.map((service) => (
                          <FormField
                            key={service}
                            control={form.control}
                            name="specializations"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={service}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(service)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, service])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== service
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {service}
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

                {/* Document Upload */}
                <FormField
                  control={form.control}
                  name="aadhaar_document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Aadhaar Card *
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                          />
                          {documentFile && (
                            <span className="text-sm text-green-600">
                              ✓ {documentFile.name}
                            </span>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MechanicRegistrationPage;
