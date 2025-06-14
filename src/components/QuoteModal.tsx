
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  companyId: string;
  orderDetails: {
    service_type: string;
    address: string;
    city: string;
    booking_date: string;
    booking_time: string;
    car_model: string;
    car_color: string;
  };
}

const QuoteModal = ({ isOpen, onClose, orderId, companyId, orderDetails }: QuoteModalProps) => {
  const [quotedPrice, setQuotedPrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitQuote = async () => {
    if (!quotedPrice) {
      toast({
        title: "Error",
        description: "Please enter a quoted price",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const priceInPaise = Math.floor(parseFloat(quotedPrice) * 100);

      const { error } = await supabase
        .from('order_quotes')
        .insert({
          order_id: orderId,
          company_id: companyId,
          quoted_price: priceInPaise,
          estimated_duration: estimatedDuration ? parseInt(estimatedDuration) : null,
          additional_notes: additionalNotes
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote submitted successfully!"
      });

      onClose();
      setQuotedPrice('');
      setEstimatedDuration('');
      setAdditionalNotes('');
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Error",
        description: "Failed to submit quote",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Quote</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <h4 className="font-medium">Order Details</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Service:</span> {orderDetails.service_type}</p>
              <p><span className="font-medium">Vehicle:</span> {orderDetails.car_color} {orderDetails.car_model}</p>
              <p><span className="font-medium">Location:</span> {orderDetails.address}, {orderDetails.city}</p>
              <p><span className="font-medium">Date & Time:</span> {orderDetails.booking_date} at {orderDetails.booking_time}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Quoted Price (₹)</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter price in rupees"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g., 60"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special conditions or notes..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleSubmitQuote} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Quote'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;
