
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building, MapPin, Phone, User, Wrench, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MechanicRegistration from './MechanicRegistration';

const companyRegistrationSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  owner_name: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your complete address'),
  city: z.string().min(2, 'Please enter your city'),
  zip_code: z.string().min(5, 'Please enter a valid zip code'),
  description: z.string().min(20, 'Please provide at least 20 characters description'),
  experience: z.string().min(1, 'Please specify your experience'),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  has_mechanic: z.boolean().default(false),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CompanyRegistrationForm = z.infer<typeof companyRegistrationSchema>;

const CompanyRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMechanicDialogOpen, setIsMechanicDialogOpen] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();

  const availableServices = [
    'Basic Car Wash',
    'Premium Car Wash',
    'Deluxe Car Wash',
    'Interior Cleaning',
    'Wax & Polish',
    'Engine Cleaning'
  ];

  const form = useForm<CompanyRegistrationForm>({
    resolver: zodResolver(companyRegistrationSchema),
    defaultValues: {
      company_name: '',
      owner_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zip_code: '',
      description: '',
      experience: '',
      services: [],
      has_mechanic: false,
      password: '',
    },
  });

  const onSubmit = async (data: CompanyRegistrationForm) => {
    setIsSubmitting(true);
    try {
      console.log('Initiating email signup for company registration:', data);

      // Create user account with email and password
      const { data: authData, error: authError } = await signUp(data.email, data.password, {
        full_name: data.owner_name,
        role: 'company'
      });

      if (authError) {
        console.error('Email signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Create the company record with proper structure
      const companyData = {
        company_name: data.company_name,
        owner_name: data.owner_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zip_code: data.zip_code,
        description: data.description,
        experience: data.experience,
        services: data.services,
        has_mechanic: data.has_mechanic,
        email: data.email,
        user_id: authData.user.id,
        status: 'pending' as const
      };

      const { error: dbError } = await supabase
        .from('companies')
        .insert(companyData);

      if (dbError) {
        console.error('Supabase error:', dbError);
        throw dbError;
      }

      toast({
        title: "Registration completed successfully!",
        description: authData.user.email_confirmed_at 
          ? "Your company registration is under review. We'll contact you soon. You are now logged in."
          : "Please check your email for a confirmation link to complete your registration.",
      });

      form.reset();
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-blue-600" />
            <span>Company Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Individual Mechanic Registration Button */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-emerald-600" />
                  Individual Mechanic?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you an individual mechanic looking to register? Click here to register as a freelance mechanic instead.
                </p>
              </div>
              <Dialog open={isMechanicDialogOpen} onOpenChange={setIsMechanicDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-4">
                    <Wrench className="h-4 w-4 mr-2" />
                    Register as Individual Mechanic
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-emerald-600" />
                      Individual Mechanic Registration
                    </DialogTitle>
                  </DialogHeader>
                  <MechanicRegistration />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="owner_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Owner's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your company and services..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@company.com" {...field} />
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a secure password" {...field} />
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

              {/* Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Services Offered</h3>
                <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableServices.map((service) => (
                          <FormField
                            key={service}
                            control={form.control}
                            name="services"
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
              </div>

              {/* Mechanic Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Additional Services
                </h3>
                
                <FormField
                  control={form.control}
                  name="has_mechanic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          We also provide mechanic services
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Check this if your company can handle vehicle repairs and mechanical issues
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Register Company'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyRegistration;
