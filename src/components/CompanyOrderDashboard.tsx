
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Phone, User, Car, Calendar, Clock } from 'lucide-react';

interface Order {
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
}

interface Quote {
  id: string;
  order_id: string;
  quoted_price: number;
  estimated_duration: number;
  additional_notes: string;
  status: string;
}

const CompanyOrderDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompanyData();
      fetchNearbyOrders();
      fetchMyQuotes();
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for company orders...');
    
    const channel = supabase
      .channel('company-order-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload);
          fetchNearbyOrders(); // Refresh when new order is created
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up company real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCompany(data);
      console.log('Company data fetched:', data);
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  const fetchNearbyOrders = async () => {
    try {
      // First, fetch orders that we've already quoted on
      const { data: quotedOrders, error: quotedError } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'confirmed', 'in_progress'])
        .order('created_at', { ascending: false });

      if (quotedError) {
        console.error('Error fetching quoted orders:', quotedError);
      } else {
        console.log('Orders with potential quotes:', quotedOrders);
        setOrders(quotedOrders || []);
      }

      // Also fetch orders that we haven't quoted on yet (pending orders without our quotes)
      if (company?.id) {
        const { data: allPendingOrders, error: pendingError } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (pendingError) {
          console.error('Error fetching pending orders:', pendingError);
        } else {
          // Filter out orders we've already quoted on
          const { data: existingQuotes } = await supabase
            .from('order_quotes')
            .select('order_id')
            .eq('company_id', company.id);

          const quotedOrderIds = existingQuotes?.map(q => q.order_id) || [];
          const unquotedOrders = allPendingOrders?.filter(order => 
            !quotedOrderIds.includes(order.id)
          ) || [];

          console.log('Pending orders without quotes:', unquotedOrders);
          setPendingOrders(unquotedOrders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyQuotes = async () => {
    if (!company) return;
    
    try {
      const { data, error } = await supabase
        .from('order_quotes')
        .select('*')
        .eq('company_id', company.id);

      if (error) throw error;
      console.log('Company quotes:', data);
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const submitQuote = async (orderId: string, price: number, duration: number, notes: string) => {
    if (!company) return;

    try {
      const { error } = await supabase
        .from('order_quotes')
        .insert({
          order_id: orderId,
          company_id: company.id,
          quoted_price: price * 100, // Convert to paise
          estimated_duration: duration,
          additional_notes: notes
        });

      if (error) throw error;

      toast({
        title: "Quote Submitted",
        description: "Your quote has been sent to the customer.",
      });

      // Move the order from pending to quoted
      setPendingOrders(prev => prev.filter(order => order.id !== orderId));
      fetchMyQuotes();
      fetchNearbyOrders();
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'in_progress' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Confirmed",
        description: "Order has been confirmed and is now in progress.",
      });

      fetchNearbyOrders();
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Error",
        description: "Failed to confirm order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getOrderQuote = (orderId: string) => {
    return quotes.find(quote => quote.order_id === orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Company Not Found</h2>
                <p>Please complete your company registration first.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const allOrdersToShow = [...pendingOrders, ...orders];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {company.company_name} - Order Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage incoming orders and provide quotes to customers
          </p>
          <Button 
            onClick={() => {
              fetchNearbyOrders();
              fetchMyQuotes();
            }}
            className="mt-4"
          >
            Refresh Orders
          </Button>
        </div>

        <div className="grid gap-6">
          {allOrdersToShow.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Orders Available</h3>
                  <p className="text-gray-600">
                    There are currently no orders in your area. Check back later!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            allOrdersToShow.map((order) => {
              const existingQuote = getOrderQuote(order.id);
              const isPendingOrder = pendingOrders.some(p => p.id === order.id);
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Car className="h-5 w-5" />
                          {order.service_type}
                          {isPendingOrder && (
                            <Badge className="bg-blue-500 text-white ml-2">New Request</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Order #{order.id.slice(0, 8)}
                        </CardDescription>
                      </div>
                      <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
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

                    {existingQuote ? (
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
                        
                        {existingQuote.status === 'accepted' && (
                          <div className="mt-3">
                            <Button 
                              onClick={() => confirmOrder(order.id)}
                              className="w-full"
                            >
                              Confirm Order & Start Service
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : order.status === 'pending' ? (
                      <QuoteForm
                        orderId={order.id}
                        onSubmit={submitQuote}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

interface QuoteFormProps {
  orderId: string;
  onSubmit: (orderId: string, price: number, duration: number, notes: string) => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ orderId, onSubmit }) => {
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !duration) return;

    setSubmitting(true);
    await onSubmit(orderId, parseInt(price), parseInt(duration), notes);
    setSubmitting(false);
    
    // Reset form
    setPrice('');
    setDuration('');
    setNotes('');
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-3">Submit Your Quote</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-md"
              placeholder="Enter price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Duration (hours)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-md"
              placeholder="Estimated hours"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-blue-200 rounded-md"
            rows={2}
            placeholder="Any additional information..."
          />
        </div>
        <Button 
          type="submit" 
          disabled={submitting || !price || !duration}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Quote'}
        </Button>
      </form>
    </div>
  );
};

export default CompanyOrderDashboard;
