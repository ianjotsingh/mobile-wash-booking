
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';

export const useMobileAppSteps = (
  user: User | null,
  loading: boolean,
  role: string | null,
  checkingCompany: boolean
) => {
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<'customer' | 'provider' | null>(null);

  useEffect(() => {
    console.log('Auth is loading...', loading ? 'true' : 'false');
    
    if (loading || checkingCompany) {
      console.log('Still loading auth or checking company status...');
      setStep('loading');
      return;
    }

    console.log('Auth state evaluation - User:', user ? user.email : 'undefined', 'Loading:', loading, 'Role:', role);

    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    const hasLocationSet = localStorage.getItem('userLocationSet');

    console.log('Storage flags:', { hasCompletedOnboarding, hasLocationSet });

    if (!user) {
      console.log('User not authenticated, checking onboarding status');
      if (!hasCompletedOnboarding) {
        console.log('Onboarding not completed, showing onboarding');
        setStep('onboarding');
      } else {
        console.log('Onboarding completed, going to front page');
        setStep('front');
      }
    } else {
      console.log('User authenticated, going to app');
      setStep('app');
    }
  }, [user, loading, role, checkingCompany]);

  useEffect(() => {
    console.log('Rendering step:', step);
  }, [step]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setStep('front');
  };

  const handleUserTypeSelect = (type: 'customer' | 'provider') => {
    console.log('User type selected:', type);
    setUserType(type);
    setStep('login');
  };

  const handleLoginSuccess = () => {
    setStep('app');
  };

  const handleBackToFront = () => {
    setUserType(null);
    setStep('front');
  };

  return {
    step,
    userType,
    handleOnboardingComplete,
    handleUserTypeSelect,
    handleLoginSuccess,
    handleBackToFront
  };
};
