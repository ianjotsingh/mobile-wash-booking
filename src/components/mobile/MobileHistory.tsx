
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Star } from 'lucide-react';

const MobileHistory = () => {
  const orders = [
    { id: 1, service: 'Premium Wash', date: 'Yesterday', price: '₹499', status: 'Completed' },
    { id: 2, service: 'Basic Wash', date: '3 days ago', price: '₹299', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{order.service}</h3>
                <span className="text-lg font-bold text-blue-600">{order.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{order.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Rate Service</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MobileHistory;
