
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface RecentOrdersCardProps {
  orders: Order[];
}

const RecentOrdersCard = ({ orders }: RecentOrdersCardProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">New orders will appear here when customers book your services.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{order.service_type}</h4>
                    <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  {order.address}, {order.city}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {order.booking_date} at {order.booking_time}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard;
