
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Car, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  user_id: string;
  service_type: string;
  address: string;
  city: string;
  zip_code: string;
  booking_date: string;
  booking_time: string;
  car_type: string;
  car_color: string;
  car_model: string;
  total_amount: number;
  status: string;
  special_instructions?: string;
  created_at: string;
}

const CompanyDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      // Set up real-time subscription for new orders
      const channel = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);
            toast({
              title: "New Order Received!",
              description: `New ${newOrder.service_type} order in ${newOrder.city}`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      toast({
        title: "Order Updated",
        description: `Order ${status === 'accepted' ? 'accepted' : 'declined'} successfully`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Dashboard</h1>
        <p className="text-gray-600">Manage your incoming service requests</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Orders</h3>
            <p className="text-gray-600">New orders will appear here automatically</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-emerald-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.service_type}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{order.status}</Badge>
                      <span className="text-sm text-gray-500">
                        Order #{order.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      ₹{(order.total_amount / 100).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {order.address}, {order.city} - {order.zip_code}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {order.booking_date} at {order.booking_time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {order.car_color} {order.car_model} ({order.car_type})
                      </span>
                    </div>
                  </div>
                  
                  {order.special_instructions && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Special Instructions:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {order.special_instructions}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Order
                  </Button>
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'declined')}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
