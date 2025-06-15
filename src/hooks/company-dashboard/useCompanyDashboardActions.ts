
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuoteData } from '@/types/companyDashboard';

interface ActionsParams {
  companyId: string | undefined;
  fetchMyQuotes: () => Promise<void>;
  fetchCompanyOrders: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export function useCompanyDashboardActions({
  companyId,
  fetchMyQuotes,
  fetchCompanyOrders,
  fetchNotifications,
}: ActionsParams) {
  const { toast } = useToast();

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
      if (companyId) fetchNotifications();
    } catch {}
  };

  const submitQuote = async (
    orderId: string,
    price: number,
    duration: number,
    notes: string
  ): Promise<void> => {
    if (!companyId) return;
    try {
      const { error } = await supabase
        .from('order_quotes')
        .insert({
          order_id: orderId,
          company_id: companyId,
          quoted_price: price * 100,
          estimated_duration: duration,
          additional_notes: notes
        });
      if (error) throw error;
      toast({ title: "Quote Submitted", description: "Your quote has been sent to the customer." });
      fetchMyQuotes();
      fetchCompanyOrders();
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
      if (companyId) fetchCompanyOrders();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { markNotificationAsRead, submitQuote, updateOrderStatus };
}
