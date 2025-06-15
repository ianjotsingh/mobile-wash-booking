
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import NotificationsPanel from './NotificationsPanel';
import DashboardHeader from './dashboard/DashboardHeader';
import CompanyOrdersLoading from './dashboard/CompanyOrdersLoading';
import CompanyOrdersEmptyState from './dashboard/CompanyOrdersEmptyState';
import CompanyOrderList from './dashboard/CompanyOrderList';
import { useCompanyDashboardData } from '@/hooks/useCompanyDashboardData';
import { NotificationData } from '@/types/companyDashboard';

const CompanyOrderDashboard = () => {
  const {
    loading,
    company,
    orders,
    quotes,
    notifications,
    markNotificationAsRead,
    submitQuote,
    updateOrderStatus
  } = useCompanyDashboardData();

  if (loading) return <CompanyOrdersLoading />;

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Company Not Found</h2>
                <p>Please complete your company registration first.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Always treat notifications as array for subcomponents
  const notificationsArray: NotificationData[] = Array.isArray(notifications) ? notifications : [];
  const unreadNotifications = notificationsArray.filter((n: NotificationData) => !n.is_read);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader companyName={company.company_name} />
        <NotificationsPanel 
          unreadNotifications={unreadNotifications}
          markNotificationAsRead={markNotificationAsRead}
        />
        {orders.length === 0 ? (
          <CompanyOrdersEmptyState />
        ) : (
          <CompanyOrderList
            orders={orders}
            quotes={quotes}
            submitQuote={submitQuote}
            acceptOrder={(orderId: string) => updateOrderStatus(orderId, 'accepted')}
            rejectOrder={(orderId: string) => updateOrderStatus(orderId, 'rejected')}
          />
        )}
      </div>
    </div>
  );
};

export default CompanyOrderDashboard;
