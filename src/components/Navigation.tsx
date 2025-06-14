import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, User, LogOut, History, Building2, Shield, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from './AuthModal';
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
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 h-16"
              style={{ minHeight: '4rem' }}
            >
              <Car className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold text-white align-middle">WashCart</span>
            </Link>
            
            {/* Navigation Dropdown */}
            <div className="flex items-center space-x-4 h-16">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-gray-800 h-10"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="hidden sm:inline">Menu</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/"
                      className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      Home
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={scrollToServices}
                    className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Services
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link
                      to="/company-signup"
                      className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      Partner With Us
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleMechanicRequest}
                    className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Call Mechanic
                  </DropdownMenuItem>
                  
                  {isCompany && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/company-dashboard"
                        className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        Company Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin-dashboard"
                        className="flex items-center space-x-2 w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {user && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link 
                          to="/order-history"
                          className="flex items-center space-x-2 w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <History className="h-4 w-4" />
                          <span>Order History</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={signOut}
                        className="flex items-center space-x-2 w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Section + Book Button */}
              {user ? (
                <div className="flex items-center space-x-2 h-16">
                  <div className="hidden sm:flex items-center gap-2 h-10">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300 text-sm">{user.email || user.phone}</span>
                  </div>
                </div>
              ) : (
                <AuthModal>
                  <Button variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white h-10">
                    Login
                  </Button>
                </AuthModal>
              )}
              
              <Button 
                onClick={handleBookNow}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-10 px-4 rounded-md flex items-center"
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
