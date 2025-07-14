
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';
type UserType = 'customer' | 'provider' | null;

export const useMobileAppSteps = () => {
  const [step, setStep] = useState<Step>('loading');
  const [userType, setUserType] = useState<UserType>(null);
  const { user, role, loading: authLoading } = useAuth();
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  console.log('=== Mobile App Steps Debug ===');
  console.log('User:', user ? user.email : 'No user');
  console.log('Auth loading:', authLoading);
  console.log('Current step:', step);
  console.log('User type:', userType);
  console.log('Role:', role);
  console.log('Has shown onboarding:', hasShownOnboarding);

  useEffect(() => {
    const onboardingShown = localStorage.getItem('onboarding_shown') === 'true';
    setHasShownOnboarding(onboardingShown);
  }, []);

  useEffect(() => {
    // If auth is still loading, stay on loading
    if (authLoading) {
      if (step !== 'loading') {
        setStep('loading');
      }
      return;
    }

    // If user is logged out
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

    // User is logged in
    if (user) {
      // Check if user needs to complete registration as service provider
      if (role === null && userType === 'provider') {
        // User is logged in but has no role and was trying to be a provider
        // Redirect to company registration
        console.log('User logged in as provider but no role, redirecting to registration');
        window.location.href = '/company/register';
        return;
      }

      // User has a role or is a customer, go to main app
      if (step !== 'app') {
        setStep('app');
        setUserType(null);
      }
      return;
    }
  }, [user, authLoading, hasShownOnboarding, step, role, userType]);

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
    console.log('Login successful, user type was:', userType);
    // Don't immediately set to 'app' - let the useEffect handle the routing
    // based on user role and type
  };

  return {
    step,
    userType,
    handleOnboardingComplete,
    handleUserTypeSelect,
    handleLoginSuccess,
  };
};
