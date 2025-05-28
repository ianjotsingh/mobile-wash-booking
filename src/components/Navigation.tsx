
import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, Calendar, Building2 } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">WashWave</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Join as Company</span>
            </Button>
            <Button className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Book Now</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
