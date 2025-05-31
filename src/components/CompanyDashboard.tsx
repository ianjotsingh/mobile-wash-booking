
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NotificationCenter from './NotificationCenter';
import OrderCard from './dashboard/OrderCard';
import RecentOrdersCard from './dashboard/RecentOrdersCard';
import DashboardHeader from './dashboard/DashboardHeader';

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

const CompanyDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Orders fetched:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`
      });

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order update received:', payload);
          fetchOrders(); // Refresh orders when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <DashboardHeader />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <NotificationCenter />
        </div>
        <div className="lg:col-span-2">
          <RecentOrdersCard orders={orders} />
        </div>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onStatusUpdate={updateOrderStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default CompanyDashboard;
