
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MobileOrderCard from './MobileOrderCard';
import { openRazorpay } from "@/utils/razorpay";
import { formatDate, formatPrice, getStatusColor, getStatusIcon } from './orderUtils';
const RAZORPAY_KEY = "rzp_test_UmRmJ86btBYits";

interface Order {
  id: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  status: string;
  address: string;
  city: string;
  car_model: string;
  car_color: string;
  created_at: string;
  payment_status: string;
}

const MobileHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRateService = (orderId: string) => {
    toast({
      title: "Rating Feature",
      description: "Rating functionality coming soon!",
    });
  };

  const handleReorder = (order: Order) => {
    localStorage.setItem('reorderData', JSON.stringify({
      serviceType: order.service_type,
      carModel: order.car_model,
      carColor: order.car_color,
      address: order.address,
      city: order.city
    }));
    toast({
      title: "Reorder",
      description: "Redirecting to booking with previous details...",
    });
  };

  // Optional: handleCancel for pending orders
  const handleCancel = (orderId: string) => {
    toast({
      title: "Cancel Feature",
      description: "Cancel functionality coming soon!",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Sign In Required</h2>
          <p className="text-gray-500">Please sign in to view your order history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            className="whitespace-nowrap"
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="shadow rounded-md bg-white p-4 animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? "You haven't made any bookings yet"
                : `No ${filter} orders found`}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Book Your First Service
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <MobileOrderCard
              key={order.id}
              order={order}
              onPayNow={async () => {
                await openRazorpay({
                  key: RAZORPAY_KEY,
                  amount: order.total_amount,
                  name: "Mobile Car Wash Service",
                  description: order.service_type,
                  prefill: {},
                  onSuccess: async (paymentId) => {
                    try {
                      const { error } = await supabase
                        .from("orders")
                        .update({ payment_status: "paid" })
                        .eq("id", order.id);
                      if (error) throw error;
                      toast({
                        title: "Payment Successful",
                        description: "Thank you! Order marked as paid.",
                      });
                      fetchOrders();
                    } catch (err) {
                      toast({
                        title: "Order Update Failed",
                        description: "Payment received, but could not update order.",
                        variant: "destructive"
                      });
                    }
                  },
                  onFailure: (err) => {
                    toast({
                      title: "Payment Cancelled",
                      description: typeof err === "string" ? err : "Payment was not completed.",
                      variant: "destructive"
                    });
                  }
                });
              }}
              onRate={() => handleRateService(order.id)}
              onReorder={() => handleReorder(order)}
              onCancel={order.status === 'pending' ? () => handleCancel(order.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MobileHistory;
