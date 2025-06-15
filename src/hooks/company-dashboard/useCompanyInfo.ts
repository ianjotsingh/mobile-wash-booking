
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyData } from '@/types/companyDashboard';
import { useAuth } from '@/hooks/useAuth';

export function useCompanyInfo() {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return { company, loading };
}
