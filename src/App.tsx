
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import MobileApp from './components/MobileApp';
import Index from './pages/Index';
import Booking from './pages/Booking';
import BookingForm from './pages/BookingForm';
import WashBookingDetails from './pages/WashBookingDetails';
import WashBookingFlow from './pages/WashBookingFlow';
import MechanicRequestForm from './pages/MechanicRequestForm';
import OrderHistory from './pages/OrderHistory';
import CompanySignup from './pages/CompanySignup';
// Removed import for CompanyDashboard and CompanyOrderDashboard (no longer exist!)
import AdminDashboard from './pages/AdminDashboard';
import MechanicRequest from './pages/MechanicRequest';
// Removed import for MechanicSignup (deleted)
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import { AuthProvider } from '@/hooks/useAuth';
import CompanyMobileDashboard from './components/dashboard/CompanyMobileDashboard'; // canonical dashboard now

const queryClient = new QueryClient();

function App() {
  // Enable mobile mode by default for preview
  const isMobileApp = true; // Changed back to mobile mode

  if (isMobileApp) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <MobileApp />
              <Toaster />
              <Sonner />
            </div>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/book-service" element={<BookingForm />} />
                <Route path="/wash-booking" element={<WashBookingDetails />} />
                <Route path="/mechanic-request-form" element={<MechanicRequestForm />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/company-signup" element={<CompanySignup />} />
                {/* Use only the new mobile dashboard! */}
                <Route path="/company-dashboard" element={<CompanyMobileDashboard />} />
                <Route path="/company/dashboard" element={<CompanyMobileDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/mechanic-request" element={<MechanicRequest />} />
                {/* Removed mechanic-signup route since we deleted the component */}
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </div>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
