
import React from 'react';
import DashboardTopBar from '../components/DashboardTopBar';

const MechanicDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <DashboardTopBar />
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Mechanic Dashboard</h1>
      <p>Welcome! This is your mechanic dashboard. Coming soon: job management, order history, and more.</p>
    </div>
  </div>
);
export default MechanicDashboard;
