
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingFlow from './onboarding/OnboardingFlow';
import MobileLogin from './auth/MobileLogin';
import LocationPermission from './location/LocationPermission';
import ConfirmLocation from './location/ConfirmLocation';
import MobileAppMain from './mobile/MobileAppMain';
import MobileFrontPage from './mobile/MobileFrontPage';
import BookingFlow from './BookingFlow';
import { useAuth } from '@/hooks/useAuth';

type AppStep = 'onboarding' | 'front' | 'login' | 'location' | 'confirm-location' | 'app';

const MobileApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('onboarding');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'provider' | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) {
      console.log('Auth is loading...');
      return;
    }

    console.log('Auth state evaluation - User:', user?.email, 'Loading:', loading);
    
    // Get stored flags
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    const hasLocationSet = localStorage.getItem('userLocationSet');
    
    console.log('Storage flags:', { hasCompletedOnboarding, hasLocationSet });
    
    if (user) {
      // User is authenticated
      console.log('User is authenticated, checking next step...');
      localStorage.setItem('hasCompletedOnboarding', 'true');
      
      if (hasLocationSet === 'true') {
        console.log('Location is set, going to main app');
        setCurrentStep('app');
      } else {
        console.log('Location not set, going to location permission');
        setCurrentStep('location');
      }
    } else {
      // User is not authenticated
      console.log('User not authenticated, checking onboarding status');
      if (hasCompletedOnboarding === 'true') {
        console.log('Onboarding completed, going to front page');
        setCurrentStep('front');
      } else {
        console.log('Starting onboarding');
        setCurrentStep('onboarding');
      }
    }
  }, [user, loading]);

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed, storing flag');
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setCurrentStep('front');
  };

  const handleUserTypeSelect = (userType: 'customer' | 'provider') => {
    console.log('User type selected:', userType);
    setSelectedUserType(userType);
    setCurrentStep('login');
  };

  const handleLoginSuccess = () => {
    console.log('Login success handler called');
    // Don't manually set step here - let useEffect handle it when user state changes
  };

  const handleLocationPermission = (location: { lat: number; lng: number }) => {
    console.log('Location permission granted:', location);
    setUserLocation(location);
    setUserAddress('Current Location');
    setCurrentStep('confirm-location');
  };

  const handleManualLocationEntry = () => {
    console.log('Manual location entry selected');
    setCurrentStep('confirm-location');
  };

  const handleLocationConfirm = (addressType: string) => {
    console.log('Location confirmed:', addressType);
    localStorage.setItem('userLocationSet', 'true');
    setCurrentStep('app');
  };

  const handleEditAddress = () => {
    console.log('Edit address requested');
    setCurrentStep('location');
  };

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and app is ready, show main app with routing
  if (currentStep === 'app' && user) {
    return (
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={<MobileAppMain userLocation={userLocation} userAddress={userAddress} />} 
          />
          <Route path="/booking" element={<BookingFlow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // Show appropriate step based on current state
  console.log('Rendering step:', currentStep);
  
  switch (currentStep) {
    case 'onboarding':
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    
    case 'front':
      return <MobileFrontPage onUserTypeSelect={handleUserTypeSelect} />;
    
    case 'login':
      return (
        <MobileLogin 
          onSuccess={handleLoginSuccess} 
          userType={selectedUserType} 
        />
      );
    
    case 'location':
      return (
        <LocationPermission
          onPermissionGranted={handleLocationPermission}
          onManualEntry={handleManualLocationEntry}
        />
      );
    
    case 'confirm-location':
      return (
        <ConfirmLocation
          address={userAddress || '456 Business Park, BKC, Mumbai'}
          onConfirm={handleLocationConfirm}
          onEdit={handleEditAddress}
        />
      );
    
    default:
      console.log('Fallback to onboarding');
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }
};

export default MobileApp;
