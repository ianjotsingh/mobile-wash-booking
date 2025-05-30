
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, User, LogOut, History, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

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

  return (
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
            <Link to="/company-dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Company Dashboard
            </Link>
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
                  <span className="text-gray-300 text-sm">{user.email}</span>
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
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Login
                </Button>
              </AuthModal>
            )}
            <Link to="/booking">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
