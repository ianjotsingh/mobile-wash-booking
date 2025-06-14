
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';

const MobileApp = () => {
  const { user, loading } = useAuth();
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<'customer' | 'provider' | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    console.log('Auth is loading...', loading ? 'true' : 'false');
    
    if (loading) {
      console.log('Still loading auth...');
      setStep('loading');
      return;
    }

    console.log('Auth state evaluation - User:', user ? user.email : 'undefined', 'Loading:', loading);

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
  }, [user, loading]);

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

  return (
    <Router>
      <Routes>
        {/* Password Reset Route - Available to everyone */}
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Company Registration Routes */}
        <Route path="/company/register" element={<CompanyRegistration />} />
        <Route path="/company/signup" element={<CompanySignup />} />
        
        {/* Mechanic Registration Routes */}
        <Route path="/mechanic/register" element={<MechanicRegistration />} />
        <Route path="/mechanic/signup" element={<MechanicSignup />} />
        <Route path="/mechanic/request" element={<MechanicRequest />} />
        
        {/* Dashboard Routes - Require Authentication */}
        <Route 
          path="/company/dashboard" 
          element={user ? <CompanyDashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={user ? <AdminDashboard /> : <Navigate to="/" />} 
        />
        
        {/* Main App Routes */}
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
            {step === 'app' && user && (
              <MobileAppMain 
                userLocation={userLocation}
                userAddress={userAddress}
              />
            )}
          </>
        } />
      </Routes>
    </Router>
  );
};

export default MobileApp;
