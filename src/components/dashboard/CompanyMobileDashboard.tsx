import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Order {
  id: string;
  service_type: string;
  address: string;
  customer_name: string;
  phone: string;
  status: string;
  amount: number;
  time: string;
  distance: string;
}

const CompanyMobileDashboard = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    ordersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompanyOrders();
      fetchDashboardStats();
    }
  }, [user]);

  const fetchCompanyOrders = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Get company ID
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (!companyData) return;

      // Fetch orders with quotes from this company
      const { data: quotes, error } = await supabase
        .from('order_quotes')
        .select(`
          *,
          orders (
            id,
            service_type,
            address,
            status,
            user_id
          )
        `)
        .eq('company_id', companyData.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profile data separately for each order
      const ordersWithCustomerData = await Promise.all(
        (quotes || []).map(async (quote) => {
          if (!quote.orders?.user_id) return null;
          
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('full_name, phone')
            .eq('user_id', quote.orders.user_id)
            .single();

          return {
            id: quote.orders?.id || '',
            service_type: quote.orders?.service_type || '',
            address: quote.orders?.address || '',
            customer_name: userProfile?.full_name || 'Customer',
            phone: userProfile?.phone || '',
            status: quote.orders?.status || 'pending',
            amount: quote.quoted_price || 0,
            time: new Date(quote.created_at).toLocaleTimeString(),
            distance: '0 km'
          };
        })
      );

      setOrders(ordersWithCustomerData.filter(order => order !== null) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Get company ID
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (!companyData) return;

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's completed orders
      const { data: todayOrders, error } = await supabase
        .from('order_quotes')
        .select(`
          quoted_price,
          orders (status, created_at)
        `)
        .eq('company_id', companyData.id)
        .eq('status', 'accepted')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (error) throw error;

      const completedToday = todayOrders?.filter(order => 
        order.orders?.status === 'completed'
      ) || [];

      const todayEarnings = completedToday.reduce((sum, order) => 
        sum + (order.quoted_price || 0), 0
      );

      setStats({
        todayEarnings,
        ordersToday: todayOrders?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'accepted': return 'bg-yellow-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'New Request';
      case 'accepted': return 'Accepted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const formatPrice = (priceInPaise: number): string => {
    return `₹${Math.floor(priceInPaise / 100)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold">Company Dashboard</h1>
        <p className="text-gray-400 text-sm">Manage your orders and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 mb-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{formatPrice(stats.todayEarnings)}</p>
                <p className="text-xs text-gray-400">Today's Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.ordersToday}</p>
                <p className="text-xs text-gray-400">Orders Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="live" className="text-xs">Live Orders</TabsTrigger>
          <TabsTrigger value="new" className="text-xs">New Requests</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No active orders at the moment</p>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white">{order.service_type}</h3>
                          <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">{formatPrice(order.amount)}</p>
                        <p className="text-xs text-gray-400">{order.time}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{order.address}</span>
                      </div>
                      {order.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Phone className="h-4 w-4" />
                          <span>{order.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {order.status === 'confirmed' && (
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          Start Service
                        </Button>
                      )}
                      {order.status === 'in_progress' && (
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No new requests at the moment</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No completed orders yet</p>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Today</span>
                    <span className="text-white font-semibold">{formatPrice(stats.todayEarnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Week</span>
                    <span className="text-white font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-white font-semibold">₹0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyMobileDashboard;
