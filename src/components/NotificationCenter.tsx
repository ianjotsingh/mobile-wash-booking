import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MapPin, Clock, Check, DollarSign, Star, Car, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QuoteModal from './QuoteModal';
import FeedbackModal from './FeedbackModal';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  order_id: string;
  quote_id?: string;
}

interface Order {
  id: string;
  service_type: string;
  address: string;
  city: string;
  booking_date: string;
  booking_time: string;
  car_model: string;
  car_color: string;
  car_type: string;
  total_amount: number;
  special_instructions?: string;
  user_id: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteModal, setQuoteModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderDetails: Order | null;
  }>({
    isOpen: false,
    orderId: '',
    orderDetails: null
  });
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderDetails: Order | null;
  }>({
    isOpen: false,
    orderId: '',
    orderDetails: null
  });
  const [companyId, setCompanyId] = useState<string>('');
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setCompanyId(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching company ID:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleProvideQuote = async (notification: Notification) => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', notification.order_id)
        .single();

      if (error) throw error;

      setQuoteModal({
        isOpen: true,
        orderId: notification.order_id,
        orderDetails: orderData
      });

      // Mark notification as read
      markAsRead(notification.id);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    }
  };

  const handleProvideFeedback = async (notification: Notification) => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', notification.order_id)
        .single();

      if (error) throw error;

      setFeedbackModal({
        isOpen: true,
        orderId: notification.order_id,
        orderDetails: orderData
      });

      markAsRead(notification.id);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchCompanyId();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification received:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: (payload.new as Notification).title,
            description: (payload.new as Notification).message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Booking Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No booking requests yet</p>
              <p className="text-sm mt-2">You'll receive notifications when customers book services in your area</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.is_read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        
                        {notification.title.includes('Quote Needed') && (
                          <div className="bg-white p-3 rounded border text-xs space-y-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>New booking request in your service area</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>Click "View Details" to see complete booking information</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="ml-2 space-y-2">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {notification.title.includes('Quote Needed') && notification.order_id && (
                        <Button
                          size="sm"
                          onClick={() => handleProvideQuote(notification)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="h-3 w-3" />
                          View Details
                        </Button>
                      )}
                      {notification.title.includes('Share Your Feedback') && notification.order_id && (
                        <Button
                          size="sm"
                          onClick={() => handleProvideFeedback(notification)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <Star className="h-3 w-3" />
                          Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {quoteModal.orderDetails && (
        <QuoteModal
          isOpen={quoteModal.isOpen}
          onClose={() => setQuoteModal({ isOpen: false, orderId: '', orderDetails: null })}
          orderId={quoteModal.orderId}
          companyId={companyId}
          orderDetails={quoteModal.orderDetails}
        />
      )}

      {feedbackModal.orderDetails && (
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={() => setFeedbackModal({ isOpen: false, orderId: '', orderDetails: null })}
          orderId={feedbackModal.orderId}
          orderDetails={feedbackModal.orderDetails}
        />
      )}
    </>
  );
};

export default NotificationCenter;
