import React from 'react';
import Navigation from '@/components/Navigation';
import BookingFlow from '@/components/BookingFlow';

const Booking = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <BookingFlow />
    </div>
  );
};

export default Booking;
