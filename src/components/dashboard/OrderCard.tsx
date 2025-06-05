
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Car, MapPin } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  service_type: string;
  address: string;
  city: string;
  zip_code: string;
  car_type: string;
  car_model: string;
  car_color: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  status: string;
  special_instructions?: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

const OrderCard = ({ order, onStatusUpdate }: OrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Convert amount from paise to rupees for display
  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toFixed(0)}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.service_type}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Order #{order.id.slice(0, 8)}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{order.booking_date}</p>
                <p className="text-sm text-gray-600">{order.booking_time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{order.address}</p>
                <p className="text-sm text-gray-600">{order.city}, {order.zip_code}</p>
                {order.latitude && order.longitude && (
                  <p className="text-xs text-gray-500">
                    Lat: {order.latitude.toFixed(6)}, Lng: {order.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Car className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{order.car_color} {order.car_model}</p>
                <p className="text-sm text-gray-600">{order.car_type}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">{formatAmount(order.total_amount)}</p>
            </div>
            
            {order.special_instructions && (
              <div>
                <p className="font-medium mb-1">Special Instructions:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {order.special_instructions}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onStatusUpdate(order.id, 'confirmed')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Accept Order
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onStatusUpdate(order.id, 'cancelled')}
                  >
                    Decline
                  </Button>
                </>
              )}
              {order.status === 'confirmed' && (
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, 'in_progress')}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Start Service
                </Button>
              )}
              {order.status === 'in_progress' && (
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(order.id, 'completed')}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Complete Service
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
