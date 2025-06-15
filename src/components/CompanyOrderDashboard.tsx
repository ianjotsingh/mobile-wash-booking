import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Phone, User, Car, Calendar, Clock, Bell } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import OrderCard from './OrderCard';
import DashboardHeader from './dashboard/DashboardHeader';
import CompanyOrdersLoading from './dashboard/CompanyOrdersLoading';
import CompanyOrdersEmptyState from './dashboard/CompanyOrdersEmptyState';
import CompanyOrderList from './dashboard/CompanyOrderList';

interface OrderData {
  id: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  address: string;
  city: string;
  car_type: string;
  car_model: string;
  car_color: string;
  special_instructions: string;
  status: string;
  total_amount: number;
  user_id: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  selected_company_id?: string;
}

interface QuoteData {
  id: string;
  order_id: string;
  quoted_price: number;
  estimated_duration: number;
  additional_notes: string;
  status: string;
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  order_id?: string;
}

interface CompanyData {
  id: string;
  company_name: string;
}

const CompanyOrderDashboard = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  useEffect(() => {
    if (company?.id) {
      fetchCompanyOrders();
      fetchMyQuotes();
      fetchNotifications();
    }
  }, [company]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!company?.id) return;

    console.log('Setting up real-time subscriptions for company:', company.id);
    
    const ordersChannel = supabase
      .channel('company-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `selected_company_id=eq.${company.id}`
        },
        (payload) => {
          console.log('New order received:', payload);
          fetchCompanyOrders();
          toast({
            title: "New Order!",
            description: `New ${payload.new.service_type} booking received!`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `company_id=eq.${company.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          fetchNotifications();
          // Show toast notification
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(ordersChannel);
    };
  }, [company?.id, toast]);

  const fetchCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCompany(data);
      console.log('Company data fetched:', data);
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  const fetchCompanyOrders = async () => {
    if (!company?.id) return;

    try {
      console.log('Fetching orders for company:', company.id);
      
      // Fetch orders specifically assigned to this company
      const { data: companyOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('selected_company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Company orders fetched:', companyOrders);
      setOrders(companyOrders || []);
    } catch (error) {
      console.error('Error fetching company orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyQuotes = async () => {
    if (!company?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('order_quotes')
        .select('*')
        .eq('company_id', company.id);

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!company?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const submitQuote = async (orderId: string, price: number, duration: number, notes: string) => {
    if (!company) return;

    try {
      const { error } = await supabase
        .from('order_quotes')
        .insert({
          order_id: orderId,
          company_id: company.id,
          quoted_price: price * 100, // Convert to paise
          estimated_duration: duration,
          additional_notes: notes
        });

      if (error) throw error;

      toast({
        title: "Quote Submitted",
        description: "Your quote has been sent to the customer.",
      });

      fetchMyQuotes();
      fetchCompanyOrders();
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'accepted' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Accepted",
        description: "Order has been accepted and customer will be notified.",
      });

      fetchCompanyOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const rejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'rejected' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Rejected",
        description: "Order has been rejected.",
      });

      fetchCompanyOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <CompanyOrdersLoading />;
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Company Not Found</h2>
                <p>Please complete your company registration first.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const unreadNotifications: NotificationData[] = notifications.filter(n => !n.is_read);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Dashboard Header (company name/description) */}
        <DashboardHeader companyName={company.company_name} />

        {/* Notifications Panel */}
        <NotificationsPanel 
          unreadNotifications={unreadNotifications}
          markNotificationAsRead={markNotificationAsRead}
        />

        {/* Order list or empty state */}
        {orders.length === 0 ? (
          <CompanyOrdersEmptyState />
        ) : (
          <CompanyOrderList
            orders={orders}
            quotes={quotes}
            submitQuote={submitQuote}
            acceptOrder={acceptOrder}
            rejectOrder={rejectOrder}
          />
        )}

      </div>
    </div>
  );
};

export default CompanyOrderDashboard;
