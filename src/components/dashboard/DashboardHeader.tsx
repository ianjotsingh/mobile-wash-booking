
import React from 'react';

interface DashboardHeaderProps {
  companyName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ companyName }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900">
      {companyName} - Order Dashboard
    </h1>
    <p className="text-gray-600 mt-2">
      Manage incoming orders and provide quotes to customers
    </p>
  </div>
);

export default DashboardHeader;
