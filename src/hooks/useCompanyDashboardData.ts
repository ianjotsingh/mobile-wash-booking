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

import { useCompanyInfo } from './company-dashboard/useCompanyInfo';
import { useCompanyOrders } from './company-dashboard/useCompanyOrders';
import { useCompanyQuotes } from './company-dashboard/useCompanyQuotes';
import { useCompanyNotifications } from './company-dashboard/useCompanyNotifications';
import { useCompanyDashboardActions } from './company-dashboard/useCompanyDashboardActions';

// There is no "Anthropic" database integration. All data is from Supabase only.

interface UseCompanyDashboardDataResult {
  loading: boolean;
  company: CompanyData | null;
  orders: OrderData[];
  quotes: QuoteData[];
  notifications: NotificationData[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  submitQuote: (orderId: string, price: number, duration: number, notes: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

export function useCompanyDashboardData(): UseCompanyDashboardDataResult {
  const { company, loading: companyLoading } = useCompanyInfo();

  const {
    orders,
    loading: ordersLoading,
    fetchCompanyOrders,
    setOrders
  } = useCompanyOrders(company?.id);

  const {
    quotes,
    fetchMyQuotes,
    setQuotes
  } = useCompanyQuotes(company?.id);

  const {
    notifications,
    fetchNotifications,
    setNotifications
  } = useCompanyNotifications(company?.id);

  const actions = useCompanyDashboardActions({
    companyId: company?.id,
    fetchMyQuotes,
    fetchCompanyOrders,
    fetchNotifications,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!company?.id) return;

    fetchCompanyOrders();
    fetchMyQuotes();
    fetchNotifications();

    const channel = supabase
      .channel('company-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `selected_company_id=eq.${company.id}` },
        payload => {
          fetchCompanyOrders();
          toast({ title: "New Order!", description: `New ${payload.new.service_type} booking received!` });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `company_id=eq.${company.id}` },
        payload => {
          fetchNotifications();
          toast({ title: payload.new.title, description: payload.new.message });
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [company?.id, toast]);

  return {
    loading: companyLoading || ordersLoading,
    company,
    orders,
    quotes,
    notifications,
    ...actions,
  };
}
