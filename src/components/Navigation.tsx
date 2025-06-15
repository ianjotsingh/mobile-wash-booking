
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, User, LogOut, History, Building2, Shield, Menu, ChevronDown, ArrowLeft } from 'lucide-react';
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

  // Show back arrow except on home page
  const showBackArrow = location.pathname !== '/';
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16 w-full">
            {/* Back Arrow Button on top left */}
            <div className="flex items-center h-16" style={{ minHeight: '4rem', minWidth: 40 }}>
              {showBackArrow && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGoBack}
                  className="mr-2 text-emerald-400 hover:text-white"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <Link 
                to="/" 
                className="flex items-center"
                style={{ minHeight: '4rem', minWidth: 40 }}
              >
                <Car className="h-8 w-8 text-emerald-400" />
              </Link>
            </div>
            
            {/* Navigation Bar Right Section */}
            <div className="flex items-center space-x-2 h-16 flex-1 justify-end">
              {/* User Profile Section + Book Button */}
              {user ? (
                <div className="flex items-center gap-2 h-10">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300 text-xs sm:text-sm" style={{ fontSize: '0.85rem' }}>
                    {user.email || user.phone}
                  </span>
                </div>
              ) : (
                <AuthModal>
                  <Button variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white h-9 px-3 py-1 text-xs sm:text-sm font-medium">
                    Login
                  </Button>
                </AuthModal>
              )}
              
              <Button 
                onClick={handleBookNow}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-9 px-3 py-1 text-xs sm:text-sm rounded-md flex items-center"
              >
                Book Now
              </Button>

              {/* DropdownMenu on extreme right */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-1 border-gray-600 text-gray-300 hover:bg-gray-800 h-9 px-2 py-1 text-xs sm:text-sm"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium" style={{ fontSize: '0.9rem' }}>Menu</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
                >
                  {/* Home Option - always visible at top! */}
                  <DropdownMenuItem asChild>
                    <Link
                      to="/"
                      className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      style={{ fontSize: '1rem' }}
                    >
                      Home
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={scrollToServices}
                    className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    style={{ fontSize: '1rem' }}
                  >
                    Services
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link
                      to="/company-signup"
                      className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      style={{ fontSize: '1rem' }}
                    >
                      Partner With Us
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleMechanicRequest}
                    className="flex items-center w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    style={{ fontSize: '1rem' }}
                  >
                    Call Mechanic
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin-dashboard"
                        className="flex items-center space-x-2 w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        style={{ fontSize: '1rem' }}
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
                          style={{ fontSize: '1rem' }}
                        >
                          <History className="h-4 w-4" />
                          <span>Order History</span>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={signOut}
                        className="flex items-center space-x-2 w-full px-2 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        style={{ fontSize: '1rem' }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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

