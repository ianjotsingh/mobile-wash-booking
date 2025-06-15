
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
    const onboardingShown = localStorage.getItem('onboarding_shown') === 'true';
    setHasShownOnboarding(onboardingShown);
  }, []);

  useEffect(() => {
    console.log('Step effect triggered:', { authLoading, user: !!user, hasShownOnboarding, step });
    
    // If auth is still loading, stay on loading
    if (authLoading) {
      if (step !== 'loading') {
        console.log('Setting step to loading');
        setStep('loading');
      }
      return;
    }

    // Auth is done, user exists -> go to app
    if (user) {
      if (step !== 'app') {
        console.log('User found, setting step to app');
        setStep('app');
        setUserType(null);
      }
      return;
    }

    // No user, decide between onboarding and front
    if (!hasShownOnboarding) {
      if (step !== 'onboarding') {
        console.log('No onboarding shown, setting step to onboarding');
        setStep('onboarding');
      }
    } else {
      if (step !== 'front') {
        console.log('Onboarding shown, setting step to front');
        setStep('front');
      }
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
