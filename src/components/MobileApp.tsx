
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyStatus } from '@/hooks/useCompanyStatus';
import { useMobileAppSteps } from '@/hooks/useMobileAppSteps';
import MobileAppRouter from './mobile/MobileAppRouter';
import MobileAppStepFlow from './mobile/MobileAppStepFlow';

const MobileApp = () => {
  const { user, loading, role } = useAuth();
  const { isCompany, checkingCompany } = useCompanyStatus(user);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  const {
    step,
    userType,
    handleOnboardingComplete,
    handleUserTypeSelect,
    handleLoginSuccess,
  } = useMobileAppSteps(user, loading, role, checkingCompany);

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

  // Debug current state
  useEffect(() => {
    console.log('=== MobileApp State ===');
    console.log('Step:', step);
    console.log('User:', user?.email);
    console.log('Role:', role);
    console.log('Loading:', loading);
    console.log('Checking company:', checkingCompany);
  }, [step, user, role, loading, checkingCompany]);

  // Force app step if user is authenticated and we're stuck loading
  useEffect(() => {
    if (user && !loading && step === 'loading') {
      console.log('Force setting step to app - user is authenticated');
      // This will be handled by useMobileAppSteps now
    }
  }, [user, loading, step]);

  return (
    <Router>
      <MobileAppStepFlow
        step={step}
        userType={userType}
        onOnboardingComplete={handleOnboardingComplete}
        onUserTypeSelect={handleUserTypeSelect}
        onLoginSuccess={handleLoginSuccess}
      >
        <MobileAppRouter 
          userLocation={userLocation}
          userAddress={userAddress}
        />
      </MobileAppStepFlow>
    </Router>
  );
};

export default MobileApp;
