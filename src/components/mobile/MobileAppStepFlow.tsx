
import React from 'react';
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
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-4xl font-bold text-white tracking-wide drop-shadow select-none">WC</span>
          </div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (step === 'onboarding') {
    return <OnboardingFlow onComplete={onOnboardingComplete} />;
  }

  if (step === 'front') {
    return <MobileFrontPage onUserTypeSelect={onUserTypeSelect} />;
  }

  if (step === 'login' && userType) {
    return <MobileLogin onSuccess={onLoginSuccess} userType={userType} />;
  }

  if (step === 'app') {
    return <>{children}</>;
  }

  return null;
};

export default MobileAppStepFlow;
