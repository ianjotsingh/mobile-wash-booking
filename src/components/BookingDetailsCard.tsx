
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car, Clock, Calendar, User, FileText } from 'lucide-react';

interface BookingDetailsCardProps {
  orderDetails: {
    id: string;
    service_type: string;
    address: string;
    city: string;
    booking_date: string;
    booking_time: string;
    car_model: string;
    car_type: string;
    special_instructions?: string;
    user_id: string;
  };
}

const BookingDetailsCard = ({ orderDetails }: BookingDetailsCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Car className="h-5 w-5" />
          Booking Request Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Service Requested:</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {orderDetails.service_type}
          </Badge>
        </div>

        {/* Address */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <MapPin className="h-4 w-4" />
            Service Location:
          </div>
          <p className="text-sm text-gray-800 pl-6 bg-white p-2 rounded border">
            {orderDetails.address}, {orderDetails.city}
          </p>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Calendar className="h-4 w-4" />
              Date:
            </div>
            <p className="text-sm text-gray-800 bg-white p-2 rounded border">
              {formatDate(orderDetails.booking_date)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Clock className="h-4 w-4" />
              Time:
            </div>
            <p className="text-sm text-gray-800 bg-white p-2 rounded border">
              {formatTime(orderDetails.booking_time)}
            </p>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Car className="h-4 w-4" />
            Vehicle Details:
          </div>
          <div className="bg-white p-2 rounded border">
            <p className="text-sm text-gray-800">
              <span className="font-medium">Type:</span> {orderDetails.car_type}
            </p>
            <p className="text-sm text-gray-800">
              <span className="font-medium">Number:</span> {orderDetails.car_model}
            </p>
          </div>
        </div>

        {/* Special Instructions */}
        {orderDetails.special_instructions && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <FileText className="h-4 w-4" />
              Special Instructions:
            </div>
            <p className="text-sm text-gray-800 bg-white p-2 rounded border">
              {orderDetails.special_instructions}
            </p>
          </div>
        )}

        {/* Contact Info Note */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
          <div className="flex items-center gap-2 text-yellow-800">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">Customer Contact</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Customer contact details will be shared once you submit your quote and it gets accepted.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingDetailsCard;
