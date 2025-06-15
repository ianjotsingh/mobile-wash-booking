
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';
type UserType = 'customer' | 'provider' | null;

export const useMobileAppSteps = () => {
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<UserType>(null);
  const { user, loading: authLoading } = useAuth();
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  console.log('=== Mobile App Steps Debug ===');
  console.log('User:', user ? user.email : 'No user');
  console.log('Auth loading:', authLoading);
  console.log('Current step:', step);
  console.log('Has shown onboarding:', hasShownOnboarding);

  useEffect(() => {
    // Check if onboarding was already shown
    const onboardingShown = localStorage.getItem('onboarding_shown') === 'true';
    setHasShownOnboarding(onboardingShown);
  }, []);

  useEffect(() => {
    if (authLoading) {
      console.log('Auth still loading - staying on loading screen');
      setStep('loading');
      return;
    }

    if (user) {
      console.log('User authenticated - going to app');
      setStep('app');
      setUserType(null); // Reset user type when authenticated
    } else {
      console.log('No user - determining next step');
      if (!hasShownOnboarding) {
        console.log('Showing onboarding');
        setStep('onboarding');
      } else {
        console.log('Showing front page');
        setStep('front');
      }
    }
  }, [user, authLoading, hasShownOnboarding]);

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed');
    localStorage.setItem('onboarding_shown', 'true');
    setHasShownOnboarding(true);
    setStep('front');
  };

  const handleUserTypeSelect = (type: 'customer' | 'provider') => {
    console.log('User type selected:', type);
    setUserType(type);
    setStep('login');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful');
    setStep('app');
    setUserType(null);
  };

  return {
    step,
    userType,
    handleOnboardingComplete,
    handleUserTypeSelect,
    handleLoginSuccess,
  };
};
