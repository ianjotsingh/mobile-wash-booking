
import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from '@/types/companyDashboard';

interface UseCompanyOrdersResult {
  orders: OrderData[];
  loading: boolean;
  fetchCompanyOrders: () => Promise<void>;
  setOrders: Dispatch<SetStateAction<OrderData[]>>;
}

export function useCompanyOrders(companyId: string | undefined): UseCompanyOrdersResult {
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

  // Explicit return type for hook to avoid deep type recursion
  return { orders, loading, fetchCompanyOrders, setOrders };
}
