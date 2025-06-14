
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Car, Clock, Star } from 'lucide-react';

interface MobileHomeProps {
  userLocation: { lat: number; lng: number } | null;
  userAddress: string;
}

const MobileHome = ({ userLocation, userAddress }: MobileHomeProps) => {
  const services = [
    { name: 'Basic Wash', price: '₹299', duration: '30 min', popular: false },
    { name: 'Premium Wash', price: '₹499', duration: '45 min', popular: true },
    { name: 'Full Detail', price: '₹899', duration: '90 min', popular: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">WashCart</h1>
            <p className="text-blue-100">Car wash at your doorstep</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <Car className="h-6 w-6" />
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center space-x-2 bg-blue-500 bg-opacity-30 rounded-lg p-3">
          <MapPin className="h-5 w-5 text-blue-200" />
          <div className="flex-1">
            <p className="text-sm text-blue-100">Service Location</p>
            <p className="font-medium truncate">{userAddress || 'Select your location'}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-100 hover:bg-blue-500">
            Change
          </Button>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-6">
        {/* Quick Book Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Book</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 h-12">
                <Car className="h-5 w-5 mr-2" />
                Book Now
              </Button>
              <Button variant="outline" className="h-12">
                <Clock className="h-5 w-5 mr-2" />
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Services</h3>
          <div className="space-y-3">
            {services.map((service, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        {service.popular && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{service.price}</p>
                      <Button size="sm" className="mt-2">Select</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Premium Wash Completed</p>
                  <p className="text-sm text-gray-600">Yesterday • ₹499</p>
                </div>
                <Button variant="ghost" size="sm">
                  Rate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
