
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';
type UserType = 'customer' | 'provider' | null;

export const useMobileAppSteps = () => {
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<UserType>(null);
  const { user, loading: authLoading } = useAuth();
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  // Debug logs
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
    // As soon as auth is NOT loading, move to the appropriate step right away
    if (authLoading) {
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
  }, [user, authLoading, hasShownOnboarding, step]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_shown', 'true');
    setHasShownOnboarding(true);
    setStep('front');
  };

  const handleUserTypeSelect = (type: 'customer' | 'provider') => {
    setUserType(type);
    setStep('login');
  };

  const handleLoginSuccess = () => {
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
