import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';
type UserType = 'customer' | 'provider' | null;

export const useMobileAppSteps = () => {
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<UserType>(null);
  const { user, loading: authLoading } = useAuth();
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Add a timeout to prevent loading being stuck forever.
    if (step === 'loading') {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        if (step === 'loading') {
          // Force transition based on onboarding
          setStep(hasShownOnboarding ? 'front' : 'onboarding');
        }
      }, 6000); // 6 seconds
    }
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [step, hasShownOnboarding]);

  useEffect(() => {
    if (authLoading) {
      // Only set loading if not already
      if (step !== 'loading') setStep('loading');
      return;
    }

    if (user) {
      setStep('app');
      setUserType(null);
    } else {
      if (!hasShownOnboarding) {
        setStep('onboarding');
      } else {
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
