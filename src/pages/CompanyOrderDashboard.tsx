
import React from 'react';
import Navigation from '@/components/Navigation';
import CompanyOrderDashboard from '@/components/CompanyOrderDashboard';

const CompanyOrderDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <CompanyOrderDashboard />
    </div>
  );
};

export default CompanyOrderDashboardPage;
