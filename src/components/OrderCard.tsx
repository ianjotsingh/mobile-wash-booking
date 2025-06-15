
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, Calendar, Clock } from 'lucide-react';
import QuoteForm from './QuoteForm';

interface OrderData {
  id: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  address: string;
  city: string;
  car_type: string;
  car_model: string;
  car_color: string;
  special_instructions: string;
  status: string;
  total_amount: number;
  user_id: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  selected_company_id?: string;
}

interface QuoteData {
  id: string;
  order_id: string;
  quoted_price: number;
  estimated_duration: number;
  additional_notes: string;
  status: string;
}

interface OrderCardProps {
  order: OrderData;
  existingQuote: QuoteData | undefined;
  submitQuote: (orderId: string, price: number, duration: number, notes: string) => void;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  existingQuote,
  submitQuote,
  acceptOrder,
  rejectOrder,
}) => {
  return (
    <Card key={order.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {order.service_type}
              {order.status === 'pending' && (
                <Badge className="bg-orange-500 text-white ml-2">Needs Response</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Order #{order.id.slice(0, 8)}
            </CardDescription>
          </div>
          <Badge variant={
            order.status === 'pending' ? 'default' : 
            order.status === 'accepted' ? 'default' :
            order.status === 'rejected' ? 'destructive' : 'secondary'
          }>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{order.address}, {order.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{new Date(order.booking_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{order.booking_time}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Vehicle:</strong> {order.car_color} {order.car_model} ({order.car_type})
            </div>
            {order.special_instructions && (
              <div className="text-sm">
                <strong>Instructions:</strong> {order.special_instructions}
              </div>
            )}
          </div>
        </div>
        {order.status === 'pending' && !existingQuote && (
          <div className="space-y-4">
            <QuoteForm
              orderId={order.id}
              onSubmit={submitQuote}
            />
            <div className="flex gap-3">
              <Button 
                onClick={() => acceptOrder(order.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Accept Order
              </Button>
              <Button 
                onClick={() => rejectOrder(order.id)}
                variant="destructive"
                className="flex-1"
              >
                Reject Order
              </Button>
            </div>
          </div>
        )}

        {existingQuote && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Your Quote</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Price:</span> ₹{Math.floor(existingQuote.quoted_price / 100)}
              </div>
              <div>
                <span className="text-green-700">Duration:</span> {existingQuote.estimated_duration} hours
              </div>
            </div>
            {existingQuote.additional_notes && (
              <div className="mt-2 text-sm">
                <span className="text-green-700">Notes:</span> {existingQuote.additional_notes}
              </div>
            )}
            <Badge className="mt-2" variant={
              existingQuote.status === 'accepted' ? 'default' : 
              existingQuote.status === 'rejected' ? 'destructive' : 'secondary'
            }>
              {existingQuote.status}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
