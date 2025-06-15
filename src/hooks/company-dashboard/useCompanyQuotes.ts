
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuoteData } from '@/types/companyDashboard';

export function useCompanyQuotes(companyId: string | undefined) {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const fetchMyQuotes = useCallback(async (): Promise<void> => {
    if (!companyId) return;
    try {
      const { data, error } = await supabase
        .from('order_quotes')
        .select('*')
        .eq('company_id', companyId);
      if (error) throw error;
      setQuotes((data || []) as QuoteData[]);
    } catch {}
  }, [companyId]);
  return { quotes, fetchMyQuotes, setQuotes };
}
