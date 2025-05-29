
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-bold text-white">WashWave</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <a href="#services" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Services
            </a>
            <Link to="/company-signup" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Partner With Us
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">{user.email}</span>
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
