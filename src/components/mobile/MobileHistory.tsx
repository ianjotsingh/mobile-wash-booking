
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, MapPin, Clock, Car, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { openRazorpay } from "@/utils/razorpay";
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
  payment_status: string; // <-- Added this line
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

  const formatPrice = (priceInPaise: number): string => {
    if (!priceInPaise || priceInPaise === 0) {
      return 'Yet to confirm';
    }
    return `₹${Math.floor(priceInPaise / 100)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Star className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_progress':
        return <Car className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRateService = (orderId: string) => {
    toast({
      title: "Rating Feature",
      description: "Rating functionality coming soon!",
    });
  };

  const handleReorder = (order: Order) => {
    // Store order details for reordering
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
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
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
            <Card key={order.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.service_type}</h3>
                      <p className="text-sm text-gray-600">
                        {order.car_color} {order.car_model}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(order.created_at)} • {order.booking_time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{order.address}, {order.city}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* Razorpay Pay Now Button for unpaid completed orders */}
                  {order.status === "completed" && order.payment_status === "unpaid" && (
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-600 flex-1"
                      onClick={async () => {
                        openRazorpay({
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
                    >
                      Pay Now
                    </Button>
                  )}
                  {order.status === "completed" && order.payment_status === "paid" && (
                    <span className="text-green-600 font-bold flex-1 py-2 text-center">Paid</span>
                  )}
                  {order.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRateService(order.id)}
                      className="flex-1"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Rate Service
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(order)}
                    className="flex-1"
                  >
                    Reorder
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileHistory;
