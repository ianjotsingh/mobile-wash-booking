
import React, { useState, useEffect } from 'react';
import OnboardingFlow from './onboarding/OnboardingFlow';
import MobileLogin from './auth/MobileLogin';
import LocationPermission from './location/LocationPermission';
import ConfirmLocation from './location/ConfirmLocation';
import CompanyMobileDashboard from './dashboard/CompanyMobileDashboard';
import { useAuth } from '@/hooks/useAuth';

type AppStep = 'onboarding' | 'login' | 'location' | 'confirm-location' | 'app';

const MobileApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('onboarding');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState('456 Business Park, BKC, Mumbai');
  const { user } = useAuth();

  useEffect(() => {
    // Skip onboarding if user is already logged in
    if (user) {
      setCurrentStep('app');
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    setCurrentStep('login');
  };

  const handleLoginSuccess = () => {
    setCurrentStep('location');
  };

  const handleLocationPermission = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    setCurrentStep('confirm-location');
  };

  const handleManualLocationEntry = () => {
    setCurrentStep('confirm-location');
  };

  const handleLocationConfirm = (addressType: string) => {
    console.log('Location confirmed as:', addressType);
    setCurrentStep('app');
  };

  const handleEditAddress = () => {
    setCurrentStep('location');
  };

  switch (currentStep) {
    case 'onboarding':
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    
    case 'login':
      return <MobileLogin onSuccess={handleLoginSuccess} />;
    
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
          address={userAddress}
          onConfirm={handleLocationConfirm}
          onEdit={handleEditAddress}
        />
      );
    
    case 'app':
      // For demo purposes, show company dashboard
      // In real app, you'd route to appropriate dashboard based on user type
      return <CompanyMobileDashboard />;
    
    default:
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }
};

export default MobileApp;
