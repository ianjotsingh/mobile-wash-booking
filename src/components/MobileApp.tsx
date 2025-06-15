
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import MobileAppMain from './mobile/MobileAppMain';
import OnboardingFlow from './onboarding/OnboardingFlow';
import MobileFrontPage from './mobile/MobileFrontPage';
import MobileLogin from './auth/MobileLogin';
import CompanyRegistration from './CompanyRegistration';
import MechanicRegistration from './MechanicRegistration';
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
import CompanyMobileDashboard from './dashboard/CompanyMobileDashboard';
import MechanicDashboard from '@/pages/MechanicDashboard';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';

const MobileApp = () => {
  const { user, loading, role } = useAuth();
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<'customer' | 'provider' | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isCompany, setIsCompany] = useState(false);
  const [checkingCompany, setCheckingCompany] = useState(false);

  // Check if user is a company when they log in
  useEffect(() => {
    const checkUserCompanyStatus = async () => {
      if (!user) {
        setIsCompany(false);
        return;
      }

      setCheckingCompany(true);
      try {
        const { data: companyData, error } = await supabase
          .from('companies')
          .select('id, status')
          .eq('user_id', user.id)
          .single();

        if (!error && companyData) {
          console.log('User is a company:', companyData.id);
          setIsCompany(true);
        } else {
          console.log('User is not a company');
          setIsCompany(false);
        }
      } catch (error) {
        console.error('Error checking company status:', error);
        setIsCompany(false);
      } finally {
        setCheckingCompany(false);
      }
    };

    checkUserCompanyStatus();
  }, [user]);

  useEffect(() => {
    console.log('Auth is loading...', loading ? 'true' : 'false');
    
    if (loading || checkingCompany) {
      console.log('Still loading auth or checking company status...');
      setStep('loading');
      return;
    }

    console.log('Auth state evaluation - User:', user ? user.email : 'undefined', 'Loading:', loading, 'Role:', role);

    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    const hasLocationSet = localStorage.getItem('userLocationSet');

    console.log('Storage flags:', { hasCompletedOnboarding, hasLocationSet });

    if (!user) {
      console.log('User not authenticated, checking onboarding status');
      if (!hasCompletedOnboarding) {
        console.log('Onboarding not completed, showing onboarding');
        setStep('onboarding');
      } else {
        console.log('Onboarding completed, going to front page');
        setStep('front');
      }
    } else {
      console.log('User authenticated, going to app');
      setStep('app');
    }
  }, [user, loading, role, checkingCompany]);

  // Get user location when authenticated
  useEffect(() => {
    if (user && !userLocation) {
      const savedLocation = localStorage.getItem('userLocation');
      const savedAddress = localStorage.getItem('userAddress');
      
      if (savedLocation && savedAddress) {
        setUserLocation(JSON.parse(savedLocation));
        setUserAddress(savedAddress);
      }
    }
  }, [user, userLocation]);

  useEffect(() => {
    console.log('Rendering step:', step);
  }, [step]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setStep('front');
  };

  const handleUserTypeSelect = (type: 'customer' | 'provider') => {
    console.log('User type selected:', type);
    setUserType(type);
    setStep('login');
  };

  const handleLoginSuccess = () => {
    setStep('app');
  };

  const handleBackToFront = () => {
    setUserType(null);
    setStep('front');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">WC</span>
          </div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const appRoutes = (
    <>
      {role === 'company' && <CompanyMobileDashboard />}
      {role === 'mechanic' && <Navigate to="/mechanic-dashboard" />}
      {(role === 'customer' || !role) && (
        <MobileAppMain 
          userLocation={userLocation}
          userAddress={userAddress}
        />
      )}
    </>
  );

  return (
    <Router>
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
        <Route path="/*" element={
          <>
            {step === 'onboarding' && (
              <OnboardingFlow onComplete={handleOnboardingComplete} />
            )}
            {step === 'front' && (
              <MobileFrontPage onUserTypeSelect={handleUserTypeSelect} />
            )}
            {step === 'login' && userType && (
              <MobileLogin 
                onSuccess={handleLoginSuccess}
                userType={userType}
              />
            )}
            {step === 'app' && user && appRoutes}
          </>
        } />
      </Routes>
    </Router>
  );
};

export default MobileApp;
