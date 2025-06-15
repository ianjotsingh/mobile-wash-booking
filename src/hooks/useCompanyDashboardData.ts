
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  OrderData,
  QuoteData,
  NotificationData,
  CompanyData
} from '@/types/companyDashboard';

// There is no "Anthropic" database integration. All data is from Supabase only.

export function useCompanyDashboardData() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch company on user
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        setCompany(data as CompanyData);
      } catch {
        setCompany(null);
      }
    })();
  }, [user]);

  // Fetch dashboard data (orders, quotes, notifications) when company is set
  useEffect(() => {
    if (!company?.id) return;

    fetchCompanyOrders(company.id);
    fetchMyQuotes(company.id);
    fetchNotifications(company.id);

    // Realtime Subscriptions
    const channel = supabase
      .channel('company-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `selected_company_id=eq.${company.id}` },
        payload => {
          fetchCompanyOrders(company.id);
          toast({ title: "New Order!", description: `New ${payload.new.service_type} booking received!` });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `company_id=eq.${company.id}` },
        payload => {
          fetchNotifications(company.id);
          toast({ title: payload.new.title, description: payload.new.message });
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [company?.id, toast]);

  // Added explicit async types
  const fetchCompanyOrders = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const { data: companyOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('selected_company_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((companyOrders || []) as OrderData[]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyQuotes = useCallback(async (id: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('order_quotes')
        .select('*')
        .eq('company_id', id);
      if (error) throw error;
      setQuotes((data || []) as QuoteData[]);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async (id: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setNotifications((data || []) as NotificationData[]);
    } catch {}
  }, []);

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
      if (company?.id) fetchNotifications(company.id);
    } catch {}
  };

  const submitQuote = async (
    orderId: string,
    price: number,
    duration: number,
    notes: string
  ): Promise<void> => {
    if (!company) return;
    try {
      const { error } = await supabase
        .from('order_quotes')
        .insert({
          order_id: orderId,
          company_id: company.id,
          quoted_price: price * 100,
          estimated_duration: duration,
          additional_notes: notes
        });
      if (error) throw error;
      toast({ title: "Quote Submitted", description: "Your quote has been sent to the customer." });
      fetchMyQuotes(company.id);
      fetchCompanyOrders(company.id);
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) throw error;
      let description = "";
      if (status === "accepted" || status === "confirmed") {
        description = "Order has been accepted and customer will be notified.";
      } else if (status === "rejected" || status === "cancelled") {
        description = "Order has been rejected.";
      } else {
        description = "Order status updated.";
      }
      toast({ title: "Order Updated", description });
      if(company?.id) fetchCompanyOrders(company.id);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Explicitly type the returned object to prevent infinite type expansion.
  return {
    loading,
    company,
    orders,
    quotes,
    notifications,
    markNotificationAsRead,
    submitQuote,
    updateOrderStatus
  } as {
    loading: boolean,
    company: CompanyData | null,
    orders: OrderData[],
    quotes: QuoteData[],
    notifications: NotificationData[],
    markNotificationAsRead: (notificationId: string) => Promise<void>,
    submitQuote: (orderId: string, price: number, duration: number, notes: string) => Promise<void>,
    updateOrderStatus: (orderId: string, status: string) => Promise<void>,
  };
}
