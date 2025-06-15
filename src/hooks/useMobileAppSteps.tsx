
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
    console.log('=== Mobile App Steps Debug ===');
    console.log('User:', user?.email || 'No user');
    console.log('Auth loading:', loading);
    console.log('Role:', role);
    console.log('Checking company:', checkingCompany);
    console.log('Current step:', step);
    
    // If still loading auth, stay on loading (but not if just checking company for too long)
    if (loading) {
      console.log('Auth still loading - staying on loading screen');
      setStep('loading');
      return;
    }

    // If checking company status for a logged in user, give it a short timeout
    if (user && checkingCompany) {
      console.log('Checking company status - brief loading');
      // Don't wait too long for company check
      const timeout = setTimeout(() => {
        console.log('Company check timeout - proceeding to app');
        setStep('app');
      }, 2000);
      
      return () => clearTimeout(timeout);
    }

    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    console.log('Has completed onboarding:', hasCompletedOnboarding);

    if (!user) {
      console.log('No user - checking onboarding status');
      if (!hasCompletedOnboarding) {
        console.log('Setting step to onboarding');
        setStep('onboarding');
      } else {
        console.log('Setting step to front');
        setStep('front');
      }
    } else {
      console.log('User authenticated - going to app, role:', role);
      setStep('app');
    }
  }, [user, loading, role, checkingCompany]);

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
