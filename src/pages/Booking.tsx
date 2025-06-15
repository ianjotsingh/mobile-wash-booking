
import React from 'react';
import Navigation from '@/components/Navigation';
import BookingFlow from '@/components/BookingFlow';

const Booking = () => {
  console.log('=== Booking Page Render ===');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Book a Service</h1>
        <BookingFlow />
      </div>
    </div>
  );
};

export default Booking;
