
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const fetchUserRole = async (uid: string, userObj?: User | null): Promise<string> => {
  try {
    // First check if user has role in user metadata (for new signups)
    if (userObj?.user_metadata?.role) {
      const metadataRole = userObj.user_metadata.role;
      if (metadataRole === 'provider') {
        console.log('Role from metadata: company');
        return 'company';
      }
      if (metadataRole === 'mechanic') {
        console.log('Role from metadata: mechanic');
        return 'mechanic';
      }
    }

    // Then, try user_profiles table
    let { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', uid)
      .maybeSingle();
    
    if (!profileError && profileData?.role) {
      console.log('Role from user_profiles:', profileData.role);
      return profileData.role;
    }
    
    // Try companies table
    let { data: companyData } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', uid)
      .maybeSingle();
    if (companyData) {
      console.log('Role from companies table: company');
      return 'company';
    }
    
    // Try mechanics table
    let { data: mechData } = await supabase
      .from('mechanics')
      .select('id')
      .eq('user_id', uid)
      .maybeSingle();
    if (mechData) {
      console.log('Role from mechanics table: mechanic');
      return 'mechanic';
    }
    
    // Default to customer
    console.log('Defaulting to role: customer');
    return 'customer';
  } catch (error) {
    console.error('Error fetching role:', error);
    return 'customer';
  }
};
