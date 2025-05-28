
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Phone, Mail, MapPin, Star, Users } from 'lucide-react';

const CompanyRegistration = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    description: '',
    experience: '',
    services: [],
    agreedToTerms: false
  });

  const serviceOptions = [
    'Basic Exterior Wash',
    'Premium Wash & Wax',
    'Interior Cleaning',
    'Full Detailing',
    'Engine Cleaning',
    'Paint Protection'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Network</h1>
        <p className="text-lg text-gray-600">Partner with us to grow your car wash business</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Growing Customer Base</h3>
          <p className="text-sm text-gray-600">Access thousands of customers in your area</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <Star className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
          <p className="text-sm text-gray-600">Build trust with our rating system</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Flexible Coverage</h3>
          <p className="text-sm text-gray-600">Choose your service areas and schedule</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Company Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" placeholder="Your Company Name" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                <Input id="ownerName" placeholder="Your Full Name" className="mt-2" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="company@example.com" className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="pl-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Address</h3>
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input id="address" placeholder="1234 Main Street" className="mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" placeholder="City" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input id="zipCode" placeholder="12345" className="mt-2" />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Details</h3>
            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your company, experience, and what makes you special..."
                className="mt-2"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <select className="w-full mt-2 p-3 border border-gray-300 rounded-md">
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Services Offered</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceOptions.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox id={service} />
                  <Label htmlFor={service} className="text-sm">{service}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and 
                <a href="#" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>. 
                I understand that my application will be reviewed before approval.
              </Label>
            </div>
            
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
              Submit Application
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              We'll review your application within 2-3 business days and contact you with next steps.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyRegistration;
