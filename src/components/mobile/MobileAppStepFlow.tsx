
import React from 'react';
import { useLocation } from 'react-router-dom';
import MobileFrontPage from './MobileFrontPage';
import OnboardingFlow from '../onboarding/OnboardingFlow';
import MobileLogin from '../auth/MobileLogin';

interface MobileAppStepFlowProps {
  step: string;
  userType: 'customer' | 'provider' | null;
  onOnboardingComplete: () => void;
  onUserTypeSelect: (type: 'customer' | 'provider') => void;
  onLoginSuccess: () => void;
  children: React.ReactNode;
}

const MobileAppStepFlow = ({
  step,
  userType,
  onOnboardingComplete,
  onUserTypeSelect,
  onLoginSuccess,
  children
}: MobileAppStepFlowProps) => {
  const location = useLocation();

  console.log('=== MobileAppStepFlow Render ===');
  console.log('Current step:', step);
  console.log('User type:', userType);
  console.log('Current path:', location.pathname);

  // If user is on mechanic registration pages, show the router directly
  if (location.pathname.includes('/mechanic')) {
    console.log('Showing mechanic pages directly');
    return <>{children}</>;
  }

  // If user is on company registration pages, show the router directly
  if (location.pathname.includes('/company')) {
    console.log('Showing company pages directly');
    return <>{children}</>;
  }

  // If user is on reset password page, show the router directly
  if (location.pathname === '/reset-password') {
    console.log('Showing reset password page directly');
    return <>{children}</>;
  }

  // Handle step-based flow for main app
  switch (step) {
    case 'onboarding':
      console.log('Rendering onboarding');
      return <OnboardingFlow onComplete={onOnboardingComplete} />;
      
    case 'front':
      console.log('Rendering front page');
      return <MobileFrontPage onUserTypeSelect={onUserTypeSelect} />;
      
    case 'login':
      console.log('Rendering login');
      return <MobileLogin userType={userType} onSuccess={onLoginSuccess} />;
      
    case 'main':
      console.log('Rendering main app');
      return <>{children}</>;
      
    default:
      console.log('Rendering default (children)');
      return <>{children}</>;
  }
};

export default MobileAppStepFlow;
