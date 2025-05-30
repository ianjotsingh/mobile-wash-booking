
import React from 'react';
import Navigation from '@/components/Navigation';
import CompanyDashboard from '@/components/CompanyDashboard';

const CompanyDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <CompanyDashboard />
    </div>
  );
};

export default CompanyDashboardPage;
