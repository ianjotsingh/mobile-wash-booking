
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderDetails: {
    service_type: string;
    address: string;
    total_amount: number;
  };
}

const FeedbackModal = ({ isOpen, onClose, orderId, orderDetails }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Please provide a rating",
        description: "Rating is required to submit feedback",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // For now, we'll store feedback in the orders table as a note
      // Since the feedback table doesn't exist in the current schema
      const { error } = await supabase
        .from('orders')
        .update({
          special_instructions: `FEEDBACK - Rating: ${rating}/5, Comment: ${comment.trim() || 'No comment'}`
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve our services"
      });

      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
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
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-green-800">Service Completed!</h3>
              <p className="text-sm text-green-600 mt-1">
                {orderDetails.service_type} at {orderDetails.address}
              </p>
              <p className="text-sm font-medium text-green-700 mt-2">
                Total: ₹{(orderDetails.total_amount / 100).toFixed(0)}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">How was your experience?</p>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Comments (Optional)
            </label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {comment.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleSubmitFeedback} 
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
