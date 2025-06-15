import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  Clock, 
  DollarSign,
  TrendingUp,
  Bell,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CompanyStatusBanner from './CompanyStatusBanner';
import NotificationCenter from './NotificationCenter';
import DashboardTopBar from './DashboardTopBar';

interface Company {
  id: string;
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  services: string[];
}

interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingQuotes: number;
  totalRevenue: number;
  averageRating: number;
}

const CompanyDashboard = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingQuotes: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanyData();
    fetchDashboardStats();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get company ID
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!companyData) return;

      // Fetch various stats
      const [quotesResult, ordersResult] = await Promise.all([
        supabase
          .from('order_quotes')
          .select('*')
          .eq('company_id', companyData.id),
        supabase
          .from('order_quotes')
          .select('quoted_price, orders(status)')
          .eq('company_id', companyData.id)
          .eq('status', 'accepted')
      ]);

      const totalQuotes = quotesResult.data?.length || 0;
      const pendingQuotes = quotesResult.data?.filter(q => q.status === 'pending').length || 0;
      const acceptedOrders = ordersResult.data || [];
      const completedOrders = acceptedOrders.filter(o => o.orders?.status === 'completed').length;
      const totalRevenue = acceptedOrders.reduce((sum, order) => sum + (order.quoted_price || 0), 0);
      
      // For now, we'll set a default rating of 0 since there are no reviews yet
      const averageRating = 0;

      setStats({
        totalOrders: acceptedOrders.length,
        completedOrders,
        pendingQuotes,
        totalRevenue,
        averageRating
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const formatPrice = (priceInPaise: number): string => {
    return `₹${Math.floor(priceInPaise / 100)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Company information not found</p>
            <Button className="mt-4" onClick={() => window.location.href = '/company-signup'}>
              Register Company
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardTopBar />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          {company.status === 'approved' ? '🟢 Active' : '🟡 Inactive'}
        </Badge>
      </div>

      {/* Company Status Banner */}
      <CompanyStatusBanner 
        status={company.status} 
        companyName={company.company_name}
      />

      {/* Dashboard Stats */}
      {company.status === 'approved' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold">{stats.totalOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold">{stats.completedOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-yellow-600" />
                <span className="text-2xl font-bold">{stats.pendingQuotes}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-2xl font-bold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Company Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Company Name</label>
              <p className="font-medium">{company.company_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Owner</label>
              <p className="font-medium">{company.owner_name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{company.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{company.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{company.address}, {company.city}</span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Services</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {company.services.map((service, index) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Panel */}
        <NotificationCenter />
      </div>
    </div>
  );
};

export default CompanyDashboard;
