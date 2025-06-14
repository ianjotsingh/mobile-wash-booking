import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Wrench, Star, Clock, MapPin, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileHomeProps {
  userLocation?: { lat: number; lng: number } | null;
  userAddress?: string;
}

const MobileHome = ({ userLocation, userAddress }: MobileHomeProps) => {
  const navigate = useNavigate();

  const handleBookWash = () => {
    navigate('/wash-booking');
  };

  const handleCallMechanic = () => {
    navigate('/mechanic-request-form');
  };

  const handleSchedule = () => {
    navigate('/wash-booking');
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Premium Car Care</h1>
        <p className="text-blue-100 mb-4">Professional services at your doorstep</p>
        <div className="flex gap-3">
          <Button 
            onClick={handleBookWash}
            className="bg-white text-blue-600 hover:bg-blue-50 flex-1"
          >
            <Car className="h-4 w-4 mr-2" />
            Book Wash
          </Button>
          <Button 
            onClick={handleCallMechanic}
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-blue-600 flex-1"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Call Mechanic
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleSchedule}>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Schedule</h3>
            <p className="text-xs text-gray-600">Book for later</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/order-history')}>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">History</h3>
            <p className="text-xs text-gray-600">Past orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Our Services</h2>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Car className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Car Wash & Detailing</h3>
                <p className="text-sm text-gray-600 mb-2">Professional exterior and interior cleaning</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    At your location
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    30-60 min
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Wrench className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold">Mechanic Services</h3>
                <p className="text-sm text-gray-600 mb-2">Emergency repairs and maintenance</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified mechanics
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Quick response
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-center">Why Choose Us?</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-medium">Verified</p>
            <p className="text-xs text-gray-600">Partners</p>
          </div>
          <div>
            <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs font-medium">4.8+ Rating</p>
            <p className="text-xs text-gray-600">Quality Service</p>
          </div>
          <div>
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium">On-Time</p>
            <p className="text-xs text-gray-600">Guaranteed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
