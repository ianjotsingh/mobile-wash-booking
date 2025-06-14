
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, User, LogOut, History, Building2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from './AuthModal';

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
        // Check if user is a company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('status')
          .eq('user_id', user.id)
          .single();

        setIsCompany(!companyError && companyData && companyData.status === 'approved');

        // Check if user is admin
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
      // Navigate to home first, then scroll
      window.location.href = '/#services';
    }
  };

  const handleMechanicRequest = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/mechanic-request');
  };

  const handleBookNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/booking');
  };

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">WashCart</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Home
              </Link>
              <button 
                onClick={scrollToServices}
                className="text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Services
              </button>
              <Link to="/company-signup" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Partner With Us
              </Link>
              <button 
                onClick={handleMechanicRequest}
                className="text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Call Mechanic
              </button>
              {/* Company Dashboard link for approved companies */}
              {isCompany && (
                <Link to="/company-dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  Company Dashboard
                </Link>
              )}
              {/* Admin Dashboard link for admin users */}
              {isAdmin && (
                <Link to="/admin-dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/order-history">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <History className="h-4 w-4" />
                      <span>Orders</span>
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300 text-sm">{user.email || user.phone}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="flex items-center space-x-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <AuthModal>
                  <Button variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white">
                    Login
                  </Button>
                </AuthModal>
              )}
              <Button 
                onClick={handleBookNow}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
              >
                Book Now
              </Button>
            </div>
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
