
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMobileAppSteps } from '@/hooks/useMobileAppSteps';
import MobileAppRouter from './mobile/MobileAppRouter';
import MobileAppStepFlow from './mobile/MobileAppStepFlow';

const MobileApp = () => {
  const { user, loading, role } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  const {
    step,
    userType,
    handleOnboardingComplete,
    handleUserTypeSelect,
    handleLoginSuccess,
  } = useMobileAppSteps(user, loading, role);

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

  // Debug current state and role fetching
  useEffect(() => {
    console.log('=== MobileApp State ===');
    console.log('Step:', step);
    console.log('User:', user ? user.email : 'No user');
    console.log('Role:', role);
    console.log('Loading:', loading);
    if (!loading && user && !role) {
      console.warn('User is logged in, but role is not found! This will block routing.');
      console.warn('Check user_profiles table for this user and their role.');
    }
    if (!user && !loading) {
      console.warn('No user is logged in.');
    }
  }, [step, user, role, loading]);

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

