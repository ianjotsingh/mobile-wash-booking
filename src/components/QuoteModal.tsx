
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BookingDetailsCard from './BookingDetailsCard';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  companyId: string;
  orderDetails: {
    id: string;
    service_type: string;
    address: string;
    city: string;
    booking_date: string;
    booking_time: string;
    car_model: string;
    car_type: string;
    special_instructions?: string;
    user_id: string;
  };
}

const QuoteModal = ({ isOpen, onClose, orderId, companyId, orderDetails }: QuoteModalProps) => {
  const [quotedPrice, setQuotedPrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitQuote = async () => {
    if (!quotedPrice || !estimatedDuration) {
      toast({
        title: "Missing Information",
        description: "Please provide quoted price and estimated duration",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(Number(quotedPrice)) || Number(quotedPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('order_quotes')
        .insert({
          order_id: orderId,
          company_id: companyId,
          quoted_price: Math.round(Number(quotedPrice) * 100), // Convert to paise
          estimated_duration: Number(estimatedDuration),
          additional_notes: additionalNotes.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Quote Submitted Successfully!",
        description: "The customer will receive your quote and can accept or decline it."
      });

      onClose();
      
      // Reset form
      setQuotedPrice('');
      setEstimatedDuration('');
      setAdditionalNotes('');
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Provide Quote for Booking Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking Details */}
          <BookingDetailsCard orderDetails={orderDetails} />

          {/* Quote Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Quote</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quotedPrice">Quoted Price (₹) *</Label>
                <Input
                  id="quotedPrice"
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="Enter price in rupees"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedDuration">Estimated Duration (minutes) *</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g., 60"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional information about your service..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={handleSubmitQuote} 
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;
