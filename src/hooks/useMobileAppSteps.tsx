
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';

export const useMobileAppSteps = (
  user: User | null,
  loading: boolean,
  role: string | null
) => {
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<'customer' | 'provider' | null>(null);

  useEffect(() => {
    console.log('=== Mobile App Steps Debug ===');
    console.log('User:', user?.email || 'No user');
    console.log('Auth loading:', loading);
    console.log('Role:', role);
    console.log('Current step:', step);
    
    // If still loading auth, stay on loading
    if (loading) {
      console.log('Auth still loading - staying on loading screen');
      if (step !== 'loading') {
        setStep('loading');
      }
      return;
    }

    // If we have a user, go directly to app
    if (user) {
      console.log('User authenticated - going to app, role:', role);
      if (step !== 'app') {
        setStep('app');
      }
      return;
    }

    // No user - check onboarding status
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    console.log('Has completed onboarding:', hasCompletedOnboarding);

    if (!hasCompletedOnboarding) {
      console.log('Setting step to onboarding');
      if (step !== 'onboarding') {
        setStep('onboarding');
      }
    } else {
      console.log('Setting step to front');
      if (step !== 'front') {
        setStep('front');
      }
    }
  }, [user, loading, role, step]);

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed');
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setStep('front');
  };

  const handleUserTypeSelect = (type: 'customer' | 'provider') => {
    console.log('User type selected:', type);
    setUserType(type);
    setStep('login');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful - going to app');
    setStep('app');
  };

  return {
    step,
    userType,
    handleOnboardingComplete,
    handleUserTypeSelect,
    handleLoginSuccess,
  };
};
