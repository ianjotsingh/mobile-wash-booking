
// All menu, dropdown, and profile logic separated into this component for clarity.
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, User, LogOut, History, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AuthModal from './AuthModal';
import { useAuth } from '@/hooks/useAuth';

interface NavigationMenuProps {
  isAdmin: boolean;
  user: any;
  signOut: () => void;
  scrollToServices: () => void;
  handleMechanicRequest: () => void;
  handleBookNow: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isAdmin,
  user,
  signOut,
  scrollToServices,
  handleMechanicRequest,
  handleBookNow,
}) => {
  return (
    <div className="flex items-center space-x-2 h-16 flex-1 justify-end">
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
  );
};

export default NavigationMenu;
