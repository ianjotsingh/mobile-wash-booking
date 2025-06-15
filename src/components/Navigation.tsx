import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from './AuthModal';
import NavigationBackButton from './NavigationBackButton';
import NavigationMenu from './NavigationMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCompany, setIsCompany] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Don't render navigation on mobile app
  const isMobileApp = window.location.search.includes('mobile=true');
  if (isMobileApp) {
    return null;
  }

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsCompany(false);
        setIsAdmin(false);
        return;
      }
      try {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('status')
          .eq('user_id', user.id)
          .single();

        setIsCompany(!companyError && companyData && companyData.status === 'approved');

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        setIsAdmin(!profileError && profileData && profileData.role === 'admin');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsCompany(false);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, [user]);

  const scrollToServices = () => {
    if (location.pathname === '/') {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#services';
    }
  };

  const handleMechanicRequest = () => {
    navigate('/mechanic-request-form');
  };

  const handleBookNow = () => {
    navigate('/wash-booking');
  };

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16 w-full">
            <div className="flex items-center h-16" style={{ minHeight: '4rem', minWidth: 40 }}>
              <NavigationBackButton />
              <Link 
                to="/" 
                className="flex items-center"
                style={{ minHeight: '4rem', minWidth: 40 }}
              >
                <Car className="h-8 w-8 text-emerald-400" />
              </Link>
            </div>
            <NavigationMenu
              isAdmin={isAdmin}
              user={user}
              signOut={signOut}
              scrollToServices={scrollToServices}
              handleMechanicRequest={handleMechanicRequest}
              handleBookNow={handleBookNow}
            />
          </div>
        </div>
      </nav>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </>
  );
};

export default Navigation;
