
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
  const { user, role, loading } = useAuth();

  // If still loading user, show a spinner to prevent premature redirect
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
      return <MobileAppMain userLocation={userLocation} userAddress={userAddress} />;
    }

    // --- FIX: If user is logged in but role is null, treat as customer ---
    // Only treat as company or mechanic if explicit role, else customer
    if (role === 'company') {
      return <Navigate to="/company-dashboard" replace />;
    }
    if (role === 'mechanic') {
      return <Navigate to="/mechanic-dashboard" replace />;
    }

    // role is null or 'customer' or unknown → show customer home!
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

      {/* Dashboard Routes */}
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
      <Route
        path="/mechanic-dashboard"
        element={user && role === 'mechanic' ? <MechanicDashboard /> : <Navigate to="/" />}
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

