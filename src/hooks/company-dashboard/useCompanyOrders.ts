
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from '@/types/companyDashboard';

export function useCompanyOrders(companyId: string | undefined) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(!!companyId);

  const fetchCompanyOrders = useCallback(async (): Promise<void> => {
    if (!companyId) return;
    setLoading(true);
    try {
      const { data: companyOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('selected_company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((companyOrders || []) as OrderData[]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Expose the function for manual refresh (do not auto-fetch in constructor; handled by parent)
  return { orders, loading, fetchCompanyOrders, setOrders };
}
