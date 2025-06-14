
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, XCircle, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Quote {
  id: string;
  company_id: string;
  quoted_price: number;
  estimated_duration: number;
  additional_notes: string;
  status: string;
  created_at: string;
  companies: {
    company_name: string;
    phone: string;
  };
}

interface QuoteViewerProps {
  orderId: string;
}

const QuoteViewer = ({ orderId }: QuoteViewerProps) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('order_quotes')
        .select(`
          *,
          companies (
            company_name,
            phone
          )
        `)
        .eq('order_id', orderId)
        .order('quoted_price', { ascending: true });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('order_quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Quote Accepted",
        description: "The service provider has been notified!"
      });

      // Refresh quotes to show updated status
      fetchQuotes();
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast({
        title: "Error",
        description: "Failed to accept quote",
        variant: "destructive"
      });
    }
  };

  const rejectQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('order_quotes')
        .update({ status: 'rejected' })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Quote Rejected",
        description: "Quote has been declined"
      });

      // Refresh quotes to show updated status
      fetchQuotes();
    } catch (error) {
      console.error('Error rejecting quote:', error);
      toast({
        title: "Error",
        description: "Failed to reject quote",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Set up real-time subscription for new quotes
    const channel = supabase
      .channel('quotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_quotes',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          fetchQuotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">Loading quotes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Service Quotes ({quotes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quotes received yet</p>
            <p className="text-sm">Service providers will send their quotes soon</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{quote.companies.company_name}</span>
                  </div>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Quoted Price</div>
                    <div className="text-xl font-bold text-green-600">
                      ₹{(quote.quoted_price / 100).toFixed(0)}
                    </div>
                  </div>
                  {quote.estimated_duration && (
                    <div>
                      <div className="text-sm text-gray-600">Estimated Duration</div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{quote.estimated_duration} minutes</span>
                      </div>
                    </div>
                  )}
                </div>

                {quote.additional_notes && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Additional Notes</div>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      {quote.additional_notes}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  Quoted on {new Date(quote.created_at).toLocaleString()}
                </div>

                {quote.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => acceptQuote(quote.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept Quote
                    </Button>
                    <Button
                      onClick={() => rejectQuote(quote.id)}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteViewer;
