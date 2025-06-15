
import { supabase } from '@/integrations/supabase/client';

export const fetchUserRole = async (uid: string): Promise<string> => {
  try {
    // First try user_profiles table
    let { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', uid)
      .maybeSingle();
    
    if (!profileError && profileData?.role) {
      return profileData.role;
    }
    
    // Try company
    let { data: companyData } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', uid)
      .maybeSingle();
    if (companyData) {
      return 'company';
    }
    
    // Try mechanic
    let { data: mechData } = await supabase
      .from('mechanics')
      .select('id')
      .eq('user_id', uid)
      .maybeSingle();
    if (mechData) {
      return 'mechanic';
    }
    
    // Default to customer
    return 'customer';
  } catch (error) {
    console.error('Error fetching role:', error);
    return 'customer';
  }
};
