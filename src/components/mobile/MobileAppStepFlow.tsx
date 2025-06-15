import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'; // import useAuth
import { useNavigate } from 'react-router-dom';
import OnboardingFlow from '../onboarding/OnboardingFlow';
import MobileFrontPage from './MobileFrontPage';
import MobileLogin from '../auth/MobileLogin';

type Step = 'loading' | 'onboarding' | 'front' | 'login' | 'app';

interface MobileAppStepFlowProps {
  step: Step;
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
}: any) => {
  console.log('=== MobileAppStepFlow Render ===');
  console.log('Current step:', step);
  console.log('User type:', userType);

  // Add navigation for role-based redirects AFTER login success
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after loading is done and user exists
    if (!loading && user && step === 'app' && role) {
      if (role === 'company') {
        if (!window.location.pathname.startsWith('/company-dashboard')) {
          console.log('Redirecting company to company-dashboard');
          navigate('/company-dashboard', { replace: true });
        }
      } else if (role === 'mechanic') {
        if (!window.location.pathname.startsWith('/mechanic-dashboard')) {
          console.log('Redirecting mechanic to mechanic-dashboard');
          navigate('/mechanic-dashboard', { replace: true });
        }
      } else {
        // Customer or unknown role - home
        if (
          window.location.pathname.startsWith('/company-dashboard') ||
          window.location.pathname.startsWith('/mechanic-dashboard')
        ) {
          // If not meant to be on dashboard, send home
          console.log('Redirecting customer/other to home');
          navigate('/', { replace: true });
        }
        // No redirect needed if already home
      }
    }
  }, [user, role, step, loading, navigate]);

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">WC</span>
          </div>
          <p className="text-gray-600 text-lg">Loading...</p>
          <p className="text-gray-400 text-sm mt-2">Step: {step}</p>
        </div>
      </div>
    );
  }

  if (step === 'onboarding') {
    console.log('Rendering onboarding flow');
    return <OnboardingFlow onComplete={onOnboardingComplete} />;
  }

  if (step === 'front') {
    console.log('Rendering front page');
    return <MobileFrontPage onUserTypeSelect={onUserTypeSelect} />;
  }

  if (step === 'login' && userType) {
    console.log('Rendering login for user type:', userType);
    return <MobileLogin onSuccess={onLoginSuccess} userType={userType} />;
  }

  if (step === 'app') {
    console.log('Rendering main app');
    return <>{children}</>;
  }

  console.log('No matching step found, staying on loading');
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-700 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">!</span>
        </div>
        <p className="text-gray-600 text-lg">Unknown State</p>
        <p className="text-gray-400 text-sm mt-2">Step: {step}, UserType: {userType}</p>
      </div>
    </div>
  );
};

export default MobileAppStepFlow;
