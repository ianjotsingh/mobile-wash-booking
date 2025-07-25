import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Car, MapPin, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FeedbackModal from './FeedbackModal';

interface Order {
  id: string;
  service_type: string;
  status: string;
  address: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  car_model: string;
  car_color: string;
}

interface OrderTrackingProps {
  orderId: string;
}

const OrderTracking = ({ orderId }: OrderTrackingProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrder();
    checkFeedbackStatus();
    subscribeToOrderUpdates();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFeedbackStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if feedback has been submitted by looking at special_instructions
      const { data } = await supabase
        .from('orders')
        .select('special_instructions')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (data?.special_instructions?.includes('FEEDBACK')) {
        setFeedbackSubmitted(true);
      }
    } catch (error) {
      console.log('No feedback found or error checking feedback:', error);
    }
  };

  const subscribeToOrderUpdates = () => {
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrder(newOrder);
          
          toast({
            title: "Order Update",
            description: `Your order status has been updated to ${newOrder.status}`,
          });

          // Show feedback modal when order is completed
          if (newOrder.status === 'completed' && !feedbackSubmitted) {
            setTimeout(() => {
              setShowFeedbackModal(true);
            }, 1000); // Small delay for better UX
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'in_progress', 'completed'];
    return steps.indexOf(status) + 1;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusMessage = (status: string) => {
    const messages = {
      pending: 'We\'re looking for a service provider for you',
      confirmed: 'Service provider confirmed! They\'re on their way',
      in_progress: 'Service is currently in progress',
      completed: 'Service completed successfully!',
      cancelled: 'Order has been cancelled'
    };
    return messages[status as keyof typeof messages] || 'Unknown status';
  };

  if (loading || !order) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStep = getStatusStep(order.status);
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'in_progress', label: 'In Progress', icon: Car },
    { key: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Order Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Tracking</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </CardTitle>
            <p className="text-gray-600">Order #{order.id.slice(0, 8)}</p>
          </CardHeader>
          <CardContent>
            {/* Status Message */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">{getStatusMessage(order.status)}</p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const isCompleted = index + 1 <= currentStep;
                const isCurrent = index + 1 === currentStep;
                const IconComponent = step.icon;

                return (
                  <div key={step.key} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <div className="text-sm text-blue-600">Current status</div>
                      )}
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show feedback button for completed orders */}
            {order.status === 'completed' && !feedbackSubmitted && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">Service Completed!</h4>
                    <p className="text-sm text-green-600">How was your experience?</p>
                  </div>
                  <Button 
                    onClick={() => setShowFeedbackModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Rate Service
                  </Button>
                </div>
              </div>
            )}

            {feedbackSubmitted && order.status === 'completed' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">Thank you for your feedback!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Service</div>
                <div className="font-medium">{order.service_type}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Amount</div>
                <div className="font-medium">₹{(order.total_amount / 100).toFixed(0)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Date & Time</div>
                <div className="font-medium">
                  {new Date(order.booking_date).toLocaleDateString()} at {order.booking_time}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Vehicle</div>
                <div className="font-medium">{order.car_color} {order.car_model}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Location</div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{order.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Provider
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat Support
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setFeedbackSubmitted(true);
        }}
        orderId={orderId}
        orderDetails={{
          service_type: order.service_type,
          address: order.address,
          total_amount: order.total_amount
        }}
      />
    </>
  );
};

export default OrderTracking;
