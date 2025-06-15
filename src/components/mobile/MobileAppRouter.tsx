
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MobileAppMain from './MobileAppMain';
import CompanyRegistration from '../CompanyRegistration';
import MechanicRegistration from '../MechanicRegistration';
import CompanyDashboard from '@/pages/CompanyDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import MechanicRequest from '@/pages/MechanicRequest';
import MechanicSignup from '@/pages/MechanicSignup';
import CompanySignup from '@/pages/CompanySignup';
import ResetPassword from '@/pages/ResetPassword';
import WashBookingDetails from '@/pages/WashBookingDetails';
import WashBookingFlow from '@/pages/WashBookingFlow';
import MechanicRequestForm from '@/pages/MechanicRequestForm';
import OrderHistory from '@/pages/OrderHistory';
import CompanyMobileDashboard from '../dashboard/CompanyMobileDashboard';
import MechanicDashboard from '@/pages/MechanicDashboard';

interface MobileAppRouterProps {
  userLocation: { lat: number; lng: number } | null;
  userAddress: string;
}

const MobileAppRouter = ({ userLocation, userAddress }: MobileAppRouterProps) => {
  const { user, role } = useAuth();

  const renderAppContent = () => {
    if (role === 'company') return <CompanyMobileDashboard />;
    if (role === 'mechanic') return <Navigate to="/mechanic-dashboard" />;
    return <MobileAppMain userLocation={userLocation} userAddress={userAddress} />;
  };

  return (
    <Routes>
      {/* Password Reset Route - Available to everyone */}
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Company Registration Routes */}
      <Route path="/company/register" element={<CompanyRegistration />} />
      <Route path="/company/signup" element={<CompanySignup />} />
      <Route path="/company-signup" element={<CompanySignup />} />
      
      {/* Mechanic Registration Routes */}
      <Route path="/mechanic/register" element={<MechanicRegistration />} />
      <Route path="/mechanic/signup" element={<MechanicSignup />} />
      <Route path="/mechanic/request" element={<MechanicRequest />} />
      
      {/* Dashboard Routes - Always redirect companies to mobile dashboard in mobile app */}
      <Route 
        path="/company/dashboard" 
        element={user && role === 'company' ? <CompanyMobileDashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/company-dashboard" 
        element={user && role === 'company' ? <CompanyMobileDashboard /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/dashboard" 
        element={user ? <AdminDashboard /> : <Navigate to="/" />} 
      />
      
      {/* Booking and Service Routes */}
      <Route path="/wash-booking" element={<WashBookingDetails />} />
      <Route path="/wash-booking-flow" element={<WashBookingFlow />} />
      <Route path="/mechanic-request-form" element={<MechanicRequestForm />} />
      <Route path="/order-history" element={<OrderHistory />} />
      
      {/* Main App Routes */}
      <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
      <Route path="/*" element={renderAppContent()} />
    </Routes>
  );
};

export default MobileAppRouter;
