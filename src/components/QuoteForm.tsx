
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

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

export default QuoteForm;
