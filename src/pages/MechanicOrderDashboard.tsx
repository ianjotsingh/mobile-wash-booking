
import React from 'react';
import Navigation from '@/components/Navigation';
import MechanicOrderDashboard from '@/components/MechanicOrderDashboard';

const MechanicOrderDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <MechanicOrderDashboard />
    </div>
  );
};

export default MechanicOrderDashboardPage;
