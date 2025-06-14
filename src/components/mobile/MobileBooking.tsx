
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

const MobileBooking = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Book a Service</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Service will be at your selected location</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Available today from 9 AM to 6 PM</span>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Continue to Service Selection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileBooking;
