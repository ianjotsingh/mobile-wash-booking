
import React from 'react';
import OrderCard from '../OrderCard';

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

interface CompanyOrderListProps {
  orders: OrderData[];
  quotes: QuoteData[];
  submitQuote: (orderId: string, price: number, duration: number, notes: string) => void;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
}

const CompanyOrderList: React.FC<CompanyOrderListProps> = ({
  orders,
  quotes,
  submitQuote,
  acceptOrder,
  rejectOrder,
}) => (
  <div className="grid gap-6">
    {orders.map((order) => {
      const existingQuote = quotes.find(quote => quote.order_id === order.id);
      return (
        <OrderCard
          key={order.id}
          order={order}
          existingQuote={existingQuote}
          submitQuote={submitQuote}
          acceptOrder={acceptOrder}
          rejectOrder={rejectOrder}
        />
      );
    })}
  </div>
);

export default CompanyOrderList;
