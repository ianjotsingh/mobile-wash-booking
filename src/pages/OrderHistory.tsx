
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Calendar, MapPin, Car, Clock } from 'lucide-react';

interface Order {
  id: string;
  service_type: string;
  address: string;
  city: string;
  booking_date: string;
  booking_time: string;
  car_type: string;
  car_color: string;
  car_model: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load order history.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-orange-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading your orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">No orders found</div>
              <p className="text-gray-500">You haven't made any bookings yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-emerald-400">{order.service_type}</CardTitle>
                      <p className="text-gray-500 text-sm">
                        Order placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p>{new Date(order.booking_date).toLocaleDateString()}</p>
                        <p>{order.booking_time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p>{order.address}</p>
                        <p>{order.city}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Car className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-sm text-gray-500">Vehicle</p>
                        <p>{order.car_model}</p>
                        <p>{order.car_color} {order.car_type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-semibold text-emerald-400">
                          ₹{(order.total_amount / 100).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
