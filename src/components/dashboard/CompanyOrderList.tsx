
import React from 'react';
import OrderCard from '../OrderCard';
import { OrderData, QuoteData } from '@/types/companyDashboard';

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
