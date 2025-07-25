
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MobileAppMain from './MobileAppMain';
import CompanyRegistration from '../CompanyRegistration';
import AdminDashboard from '@/pages/AdminDashboard';
import MechanicRequest from '@/pages/MechanicRequest';
import MechanicRegistrationPage from '@/pages/MechanicRegistrationPage';
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
  const { user, role, loading } = useAuth();

  console.log('=== MobileAppRouter Debug ===');
  console.log('User:', user?.email || 'None');
  console.log('Role:', role || 'None');
  console.log('Loading:', loading);
  console.log('Current path:', window.location.pathname);

  // Show loading only if auth is actually loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-3xl font-bold text-white tracking-wide drop-shadow select-none">WC</span>
          </div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Role-based default route logic
  const getDefaultRoute = () => {
    if (!user) {
      // Not logged in - show customer home
      console.log('No user, showing customer home');
      return <MobileAppMain userLocation={userLocation} userAddress={userAddress} />;
    }

    // User is logged in - route based on role
    const userRole = role || 'customer';
    console.log('User logged in with role:', userRole);

    if (userRole === 'company') {
      return <Navigate to="/company-dashboard" replace />;
    }
    if (userRole === 'mechanic') {
      return <Navigate to="/mechanic-dashboard" replace />;
    }

    // Default to customer home for customers and unknown roles
    return <MobileAppMain userLocation={userLocation} userAddress={userAddress} />;
  };

  return (
    <Routes>
      {/* Public Routes - Available to everyone */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Mechanic Registration Routes - Public access */}
      <Route path="/mechanic/signup" element={<MechanicRegistrationPage />} />
      <Route path="/mechanic-signup" element={<MechanicRegistrationPage />} />
      <Route path="/mechanic/request" element={<MechanicRequest />} />

      {/* Company Registration Routes - Public access but redirect based on auth state */}
      <Route 
        path="/company/register" 
        element={
          user && role === null ? 
            <CompanyRegistration /> : 
            user && role === 'company' ? 
              <Navigate to="/company-dashboard" replace /> :
              <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/company/signup" 
        element={
          user && role === null ? 
            <CompanyRegistration /> : 
            user && role === 'company' ? 
              <Navigate to="/company-dashboard" replace /> :
              <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/company-signup" 
        element={
          user && role === null ? 
            <CompanyRegistration /> : 
            user && role === 'company' ? 
              <Navigate to="/company-dashboard" replace /> :
              <Navigate to="/" replace />
        } 
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/company/dashboard"
        element={user && role === 'company' ? <CompanyMobileDashboard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/company-dashboard"
        element={user && role === 'company' ? <CompanyMobileDashboard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={user && role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/mechanic-dashboard"
        element={user && role === 'mechanic' ? <MechanicDashboard /> : <Navigate to="/" replace />}
      />

      {/* Booking and Service Routes */}
      <Route path="/wash-booking" element={<WashBookingDetails />} />
      <Route path="/wash-booking-flow" element={<WashBookingFlow />} />
      <Route path="/mechanic-request-form" element={<MechanicRequestForm />} />
      <Route path="/order-history" element={<OrderHistory />} />

      {/* Default Route - Role-based routing */}
      <Route path="/*" element={getDefaultRoute()} />
    </Routes>
  );
};

export default MobileAppRouter;
