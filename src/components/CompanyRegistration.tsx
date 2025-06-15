import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CompanyRegistration = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Helper to detect if running as mobile app (copied from Navigation.tsx logic)
  const isMobileApp = typeof window !== "undefined" && window.location.search.includes('mobile=true');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { data, error } = await supabase
        .from('companies')
        .insert([
          {
            user_id: user.id,
            company_name: companyName,
            owner_name: '', // Update if you add an input
            email: contactEmail,
            phone: contactPhone,
            address: '',
            city: '',
            zip_code: '',
            description: companyDescription,
            status: 'pending',
            // type: companyType,
          },
        ]);

      if (error) {
        console.error('Company registration error:', error);
        toast({
          title: 'Error',
          description: 'Failed to register company. Please try again.',
          variant: 'destructive',
        });
      } else {
        // Immediately refresh the user's role before redirect!
        if (user) {
          // Import fetchUserRole directly to force refresh
          const { fetchUserRole } = await import('@/hooks/useRoleFetcher');
          await fetchUserRole(user.id);
        }

        toast({
          title: 'Success!',
          description: 'Company registered successfully! Redirecting to your dashboard...',
          variant: 'default',
        });

        setTimeout(() => {
          if (isMobileApp) {
            window.location.href = "/company/dashboard";
          } else {
            window.location.href = "/company-dashboard";
          }
        }, 1200);
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

  return (
    <div className="container py-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  type="tel"
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Registering...' : 'Register Company'}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Why Register Your Company?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              Registering your company allows you to:
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Gain access to our platform's full suite of tools and services.</li>
              <li>Showcase your services to a wider audience.</li>
              <li>Manage your bookings and services efficiently.</li>
              <li>Build trust and credibility with customers.</li>
            </ul>
            <div className="text-sm text-gray-600">
              Start your journey with us today!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyRegistration;
