
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Car, Clock, Star } from 'lucide-react';

const BenefitsSidebar: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>Why Join Us?</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium">Local Customer Base</p>
            <p className="text-sm text-gray-600">Connect with customers in your area</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium">Flexible Schedule</p>
            <p className="text-sm text-gray-600">Work on your own terms</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Car className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium">Grow Your Business</p>
            <p className="text-sm text-gray-600">Expand your service offerings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BenefitsSidebar;
