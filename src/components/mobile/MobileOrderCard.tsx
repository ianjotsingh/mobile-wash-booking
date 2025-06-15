
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, MapPin, Clock, Car } from 'lucide-react';
import { formatDate, formatPrice, getStatusColor, getStatusIcon } from './orderUtils';

interface Order {
  id: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  status: string;
  address: string;
  city: string;
  car_model: string;
  car_color: string;
  created_at: string;
  payment_status: string;
}

interface MobileOrderCardProps {
  order: Order;
  onPayNow: () => Promise<void>;
  onRate: () => void;
  onReorder: () => void;
  onCancel?: () => void;
}

const MobileOrderCard: React.FC<MobileOrderCardProps> = ({
  order,
  onPayNow,
  onRate,
  onReorder,
  onCancel,
}) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {getStatusIcon(order.status, { Star, Clock, Car, Calendar })}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{order.service_type}</h3>
              <p className="text-sm text-gray-600">
                {order.car_color} {order.car_model}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ')}
            </span>
            <p className="text-lg font-bold text-blue-600 mt-1">
              {formatPrice(order.total_amount)}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(order.created_at)} • {order.booking_time}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{order.address}, {order.city}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          {/* Razorpay Pay Now Button for unpaid completed orders */}
          {order.status === "completed" && order.payment_status === "unpaid" && (
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 flex-1"
              onClick={onPayNow}
            >
              Pay Now
            </Button>
          )}
          {order.status === "completed" && order.payment_status === "paid" && (
            <span className="text-green-600 font-bold flex-1 py-2 text-center">Paid</span>
          )}
          {order.status === "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRate}
              className="flex-1"
            >
              <Star className="h-4 w-4 mr-1" />
              Rate Service
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onReorder}
            className="flex-1"
          >
            Reorder
          </Button>
          {order.status === 'pending' && onCancel && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:text-red-700"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileOrderCard;
