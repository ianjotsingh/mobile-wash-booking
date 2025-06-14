
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Car, Star, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import AuthModal from '@/components/AuthModal';
import FeedbackModal from '@/components/FeedbackModal';
import QuoteViewer from '@/components/QuoteViewer';

interface Order {
  id: string;
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

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderDetails: {
      service_type: string;
      address: string;
      total_amount: number;
    } | null;
  }>({
    isOpen: false,
    orderId: '',
    orderDetails: null
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    if (!amount || amount === 0) {
      return 'Yet to confirm';
    }
    return `₹${(amount / 100).toFixed(0)}`;
  };

  const openFeedbackModal = (order: Order) => {
    setFeedbackModal({
      isOpen: true,
      orderId: order.id,
      orderDetails: {
        service_type: order.service_type,
        address: order.address,
        total_amount: order.total_amount
      }
    });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      orderId: '',
      orderDetails: null
    });
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Login Required</h3>
              <p className="text-gray-600 mb-6">Please login to view your order history.</p>
              <AuthModal>
                <Button className="bg-emerald-500 hover:bg-emerald-600">Login / Sign Up</Button>
              </AuthModal>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track your car wash service bookings</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">You haven't booked any car wash services yet.</p>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                Book Your First Wash
              </Button>
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
                        {formatAmount(order.total_amount)}
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
                  
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="flex space-x-2">
                      {order.status === 'completed' && (
                        <Button
                          onClick={() => openFeedbackModal(order)}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Star className="h-4 w-4" />
                          <span>Rate Service</span>
                        </Button>
                      )}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <Button
                          onClick={() => toggleOrderExpansion(order.id)}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span>View Quotes</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded section for quotes */}
                  {expandedOrder === order.id && (
                    <div className="mt-4 pt-4 border-t">
                      <QuoteViewer orderId={order.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {feedbackModal.orderDetails && (
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={closeFeedbackModal}
          orderId={feedbackModal.orderId}
          orderDetails={feedbackModal.orderDetails}
        />
      )}
    </div>
  );
};

export default OrderHistory;
