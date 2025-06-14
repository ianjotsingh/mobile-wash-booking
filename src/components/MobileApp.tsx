
import React, { useState, useEffect } from 'react';
import OnboardingFlow from './onboarding/OnboardingFlow';
import MobileLogin from './auth/MobileLogin';
import LocationPermission from './location/LocationPermission';
import ConfirmLocation from './location/ConfirmLocation';
import MobileAppMain from './mobile/MobileAppMain';
import MobileFrontPage from './mobile/MobileFrontPage';
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
    if (loading) return;

    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    if (user) {
      // User is logged in
      if (hasCompletedOnboarding) {
        setCurrentStep('app');
      } else {
        setCurrentStep('location');
      }
    } else {
      // User is not logged in
      if (hasCompletedOnboarding) {
        setCurrentStep('front');
      } else {
        setCurrentStep('onboarding');
      }
    }
  }, [user, loading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setCurrentStep('front');
  };

  const handleUserTypeSelect = (userType: 'customer' | 'provider') => {
    setSelectedUserType(userType);
    setCurrentStep('login');
  };

  const handleLoginSuccess = () => {
    setCurrentStep('location');
  };

  const handleLocationPermission = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    setUserAddress('Current Location');
    setCurrentStep('confirm-location');
  };

  const handleManualLocationEntry = () => {
    setCurrentStep('confirm-location');
  };

  const handleLocationConfirm = (addressType: string) => {
    console.log('Location confirmed as:', addressType);
    localStorage.setItem('userLocationSet', 'true');
    setCurrentStep('app');
  };

  const handleEditAddress = () => {
    setCurrentStep('location');
  };

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  switch (currentStep) {
    case 'onboarding':
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    
    case 'front':
      return <MobileFrontPage onUserTypeSelect={handleUserTypeSelect} />;
    
    case 'login':
      return <MobileLogin onSuccess={handleLoginSuccess} userType={selectedUserType} />;
    
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
    
    case 'app':
      return <MobileAppMain userLocation={userLocation} userAddress={userAddress} />;
    
    default:
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }
};

export default MobileApp;
