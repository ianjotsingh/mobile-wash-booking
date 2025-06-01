
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NotificationCenter from './NotificationCenter';
import OrderCard from './dashboard/OrderCard';
import RecentOrdersCard from './dashboard/RecentOrdersCard';
import MechanicRequestsCard from './dashboard/MechanicRequestsCard';
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

interface MechanicRequest {
  id: string;
  problem_description: string;
  car_model: string;
  phone: string;
  address: string;
  city: string;
  zip_code: string;
  status: string;
  created_at: string;
}

const CompanyDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mechanicRequests, setMechanicRequests] = useState<MechanicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
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

  const fetchMechanicRequests = async () => {
    try {
      console.log('Fetching mechanic requests...');
      // Using any type to bypass TypeScript issues with new table
      const { data, error } = await (supabase as any)
        .from('mechanic_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mechanic requests:', error);
        throw error;
      }

      console.log('Mechanic requests fetched:', data);
      setMechanicRequests(data || []);
    } catch (error) {
      console.error('Error fetching mechanic requests:', error);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching company info:', error);
        return;
      }

      setCompany(data);
    } catch (error) {
      console.error('Error fetching company info:', error);
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
    fetchMechanicRequests();
    fetchCompanyInfo();

    // Set up real-time subscription for orders
    const ordersChannel = supabase
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

    // Set up real-time subscription for mechanic requests
    const mechanicChannel = supabase
      .channel('mechanic-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mechanic_requests'
        },
        (payload) => {
          console.log('Mechanic request update received:', payload);
          fetchMechanicRequests(); // Refresh mechanic requests when changes occur
          
          // Show toast notification for new mechanic requests
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Mechanic Request",
              description: "A new mechanic request has been received!",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(mechanicChannel);
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Loading dashboard...</div>
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

      {/* Show mechanic requests only if company offers mechanic services */}
      {company?.has_mechanic && (
        <div className="mb-8">
          <MechanicRequestsCard 
            requests={mechanicRequests} 
            onRequestUpdate={fetchMechanicRequests}
          />
        </div>
      )}

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
