
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Wrench, MapPin, Phone, User, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const mechanicRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your complete address'),
  city: z.string().min(2, 'Please enter your city'),
  zip_code: z.string().min(5, 'Please enter a valid zip code'),
  experience: z.string().min(1, 'Please specify your experience'),
  specializations: z.array(z.string()).min(1, 'Please select at least one specialization'),
  id_document: z.any().refine((file) => file instanceof File, 'Please upload your Aadhaar or PAN card'),
});

type MechanicRegistrationForm = z.infer<typeof mechanicRegistrationSchema>;

const MechanicRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { signUp } = useAuth();

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
      email: '',
      password: '',
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
      form.setValue('id_document', file);
    }
  };

  const onSubmit = async (data: MechanicRegistrationForm) => {
    setIsSubmitting(true);
    try {
      console.log('Starting mechanic registration:', data.email);

      // First, sign up the user
      const { data: authData, error: authError } = await signUp(data.email, data.password, {
        full_name: data.full_name,
        role: 'mechanic'
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('User registration failed');
      }

      // Upload the document if provided
      let documentUrl = '';
      if (documentFile) {
        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('mechanic_documents')
          .upload(fileName, documentFile);

        if (uploadError) {
          console.error('Document upload error:', uploadError);
          // Continue without document if upload fails
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('mechanic_documents')
            .getPublicUrl(fileName);
          documentUrl = publicUrl;
        }
      }

      // Structure the data to match the database schema
      const mechanicData = {
        user_id: authData.user.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zip_code: data.zip_code,
        experience: data.experience,
        description: documentUrl ? `Document: ${documentUrl}` : 'No document uploaded',
        hourly_rate: 50000,
        specializations: data.specializations,
        status: 'pending'
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
        description: "Your mechanic registration is under review. Please check your email for verification.",
      });

      form.reset();
      setDocumentFile(null);
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration failed",
        description: error.message || "There was an error completing your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-6 w-6 text-emerald-600" />
            <span>Mechanic Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Personal Information */}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create password" {...field} />
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

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Complete address" {...field} />
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

              {/* Experience */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5 years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Document Upload */}
              <FormField
                control={form.control}
                name="id_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Aadhaar or PAN Card
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

              {/* Specializations */}
              <FormField
                control={form.control}
                name="specializations"
                render={() => (
                  <FormItem>
                    <FormLabel>Specializations</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
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

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register as Mechanic'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MechanicRegistration;
