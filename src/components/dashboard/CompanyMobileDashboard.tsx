
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
  TrendingUp,
  RefreshCw
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
  latitude?: number;
  longitude?: number;
}

const CompanyMobileDashboard = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    ordersToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompanyOrders();
      fetchDashboardStats();
    }
  }, [user]);

  // Set up real-time subscription for new orders
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for orders...');
    
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received via real-time:', payload);
          fetchCompanyOrders(); // Refresh orders when new order is created
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_quotes'
        },
        (payload) => {
          console.log('New quote received via real-time:', payload);
          fetchCompanyOrders(); // Refresh orders when new quote is created
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const fetchCompanyOrders = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      console.log('Fetching company orders for user:', currentUser.id);

      // Get company ID and location
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, latitude, longitude, company_name')
        .eq('user_id', currentUser.id)
        .single();

      if (companyError) {
        console.error('Error fetching company:', companyError);
        return;
      }

      if (!companyData) {
        console.log('No company found for user');
        return;
      }

      console.log('Company data:', companyData);

      // First, let's fetch ALL orders to see what's available
      const { data: allOrdersData, error: allOrdersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (allOrdersError) {
        console.error('Error fetching all orders:', allOrdersError);
      } else {
        console.log('ALL ORDERS in database:', allOrdersData);
        setAllOrders(allOrdersData || []);
      }

      // Fetch pending orders to check distance
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Error fetching pending orders:', pendingError);
      } else {
        console.log('PENDING ORDERS:', pendingOrders);
        
        // Check distances for all pending orders
        if (pendingOrders && companyData.latitude && companyData.longitude) {
          pendingOrders.forEach((order) => {
            if (order.latitude && order.longitude) {
              const distance = calculateDistance(
                companyData.latitude,
                companyData.longitude,
                order.latitude,
                order.longitude
              );
              console.log(`Order ${order.id} distance: ${distance.toFixed(2)} km`, {
                orderLocation: { lat: order.latitude, lng: order.longitude },
                companyLocation: { lat: companyData.latitude, lng: companyData.longitude },
                orderAddress: order.address
              });
            } else {
              console.log(`Order ${order.id} has no location data:`, order);
            }
          });
        }
      }

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
            user_id,
            created_at,
            latitude,
            longitude
          )
        `)
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }

      console.log('Quotes for company:', quotes);

      // Get user profile data separately for each order
      const ordersWithCustomerData = await Promise.all(
        (quotes || []).map(async (quote) => {
          if (!quote.orders?.user_id) return null;
          
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('full_name, phone')
            .eq('user_id', quote.orders.user_id)
            .single();

          let distance = '0 km';
          if (quote.orders.latitude && quote.orders.longitude && companyData.latitude && companyData.longitude) {
            const dist = calculateDistance(
              companyData.latitude,
              companyData.longitude,
              quote.orders.latitude,
              quote.orders.longitude
            );
            distance = `${dist.toFixed(1)} km`;
          }

          return {
            id: quote.orders?.id || '',
            service_type: quote.orders?.service_type || '',
            address: quote.orders?.address || '',
            customer_name: userProfile?.full_name || 'Customer',
            phone: userProfile?.phone || '',
            status: quote.orders?.status || 'pending',
            amount: quote.quoted_price || 0,
            time: new Date(quote.created_at).toLocaleTimeString(),
            distance,
            latitude: quote.orders?.latitude,
            longitude: quote.orders?.longitude
          };
        })
      );

      const validOrders = ordersWithCustomerData.filter(order => order !== null) as Order[];
      console.log('Processed orders for dashboard:', validOrders);
      setOrders(validOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCompanyOrders();
    await fetchDashboardStats();
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Company Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage your orders and earnings</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <p className="text-xs text-gray-400">
          Debug: Total orders in DB: {allOrders.length} | Orders with quotes: {orders.length}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 mb-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">₹{stats.todayEarnings}</p>
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
                <p className="text-xs text-gray-500 mt-2">
                  {allOrders.length > 0 ? 
                    `Found ${allOrders.length} orders in database but none assigned to your company yet` :
                    'No orders found in database'
                  }
                </p>
                <Button 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Orders'}
                </Button>
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
                        <p className="text-lg font-bold text-green-400">₹{order.amount}</p>
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
                    <span className="text-white font-semibold">₹{stats.todayEarnings}</span>
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
