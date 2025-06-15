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
  console.log('User type:', userType);
  console.log('Has shown onboarding:', hasShownOnboarding);

  useEffect(() => {
    const onboardingShown = localStorage.getItem('onboarding_shown') === 'true';
    setHasShownOnboarding(onboardingShown);
  }, []);

  useEffect(() => {
    // Step effect triggered on auth state change, onboarding, etc

    // If auth is still loading, stay on loading
    if (authLoading) {
      if (step !== 'loading') {
        setStep('loading');
      }
      return;
    }

    // ***** FIX FOR LOGOUT *****
    // If user is logged out (user == null), always set appropriate step
    if (!user) {
      if (!hasShownOnboarding) {
        if (step !== 'onboarding') setStep('onboarding');
      } else {
        if (step !== 'front' && step !== 'onboarding' && step !== 'login') {
          setStep('front');
          setUserType(null);
        }
      }
      return;
    }

    // Auth is done, user exists -> go to app
    if (user) {
      if (step !== 'app') {
        setStep('app');
        setUserType(null);
      }
      return;
    }
  }, [user, authLoading, hasShownOnboarding, step]);

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
