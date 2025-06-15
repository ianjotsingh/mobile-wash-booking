
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
}: MobileAppStepFlowProps) => {
  console.log('=== MobileAppStepFlow Render ===');
  console.log('Current step:', step);
  console.log('User type:', userType);

  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect when we have a user and we're in the app step
    if (!loading && user && step === 'app' && !hasRedirected.current) {
      hasRedirected.current = true;
      
      console.log('Redirecting user with role:', role);
      
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
        // Customer or unknown role - stay on current page or go home
        if (
          window.location.pathname.startsWith('/company-dashboard') ||
          window.location.pathname.startsWith('/mechanic-dashboard')
        ) {
          console.log('Redirecting customer/other to home');
          navigate('/', { replace: true });
        }
      }
    }
    
    // Reset redirect state when user changes
    if (!user || loading || step !== 'app') {
      hasRedirected.current = false;
    }
  }, [user, role, loading, step, navigate]);

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">WC</span>
          </div>
          <p className="text-gray-600 text-lg">Loading...</p>
          <div className="mt-4 space-y-2">
            <p className="text-gray-400 text-sm">
              Auth Loading: {loading ? 'Yes' : 'No'} | User: {user ? 'Yes' : 'No'} | Step: {step}
            </p>
            {!loading && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                onClick={() => window.location.reload()}
              >
                Reload if stuck
              </button>
            )}
          </div>
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

  console.log('No matching step found, showing error state');
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-700 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">!</span>
        </div>
        <p className="text-gray-600 text-lg">Something went wrong</p>
        <p className="text-gray-400 text-sm mt-2">Step: {step}, UserType: {userType}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload App
        </button>
      </div>
    </div>
  );
};

export default MobileAppStepFlow;
