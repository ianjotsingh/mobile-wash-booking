
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyStatus = (user: User | null) => {
  const [isCompany, setIsCompany] = useState(false);
  const [checkingCompany, setCheckingCompany] = useState(false);

  useEffect(() => {
    const checkUserCompanyStatus = async () => {
      if (!user) {
        console.log('No user - not checking company status');
        setIsCompany(false);
        setCheckingCompany(false);
        return;
      }

      console.log('Checking company status for user:', user.id);
      setCheckingCompany(true);
      
      try {
        const { data: companyData, error } = await supabase
          .from('companies')
          .select('id, status')
          .eq('user_id', user.id)
          .single();

        if (!error && companyData) {
          console.log('User is a company:', companyData.id);
          setIsCompany(true);
        } else {
          console.log('User is not a company');
          setIsCompany(false);
        }
      } catch (error) {
        console.error('Error checking company status:', error);
        setIsCompany(false);
      } finally {
        console.log('Company status check completed');
        setCheckingCompany(false);
      }
    };

    checkUserCompanyStatus();
  }, [user]);

  return { isCompany, checkingCompany };
};
