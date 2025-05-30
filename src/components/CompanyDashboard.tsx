
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Car, Phone, User } from 'lucide-react';
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
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload);
          const newOrder = payload.new as Order;
          setOrders(prev => [newOrder, ...prev]);
          
          toast({
            title: "New Order Received!",
            description: `New ${newOrder.service_type} order in ${newOrder.city}`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated:', payload);
          const updatedOrder = payload.new as Order;
          setOrders(prev => prev.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders' as any)
        .select('*')
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders' as any)
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Dashboard</h1>
        <p className="text-gray-600">Manage your car wash service orders</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-gray-600">Orders will appear here when customers book services in your area.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.service_type}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
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
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{order.booking_date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{order.booking_time}</span>
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
                
                <div className="mt-6 flex gap-2 flex-wrap">
                  {order.status === 'pending' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Accept Order
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'in_progress')}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Start Service
                    </Button>
                  )}
                  {order.status === 'in_progress' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Complete Service
                    </Button>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Decline
                    </Button>
                  )}
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
