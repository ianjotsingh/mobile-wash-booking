
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationData } from '@/types/companyDashboard';

export function useCompanyNotifications(companyId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const fetchNotifications = useCallback(async (): Promise<void> => {
    if (!companyId) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setNotifications((data || []) as NotificationData[]);
    } catch {}
  }, [companyId]);
  return { notifications, fetchNotifications };
}
