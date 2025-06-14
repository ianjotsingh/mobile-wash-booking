
import React from 'react';
import Navigation from '@/components/Navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;
