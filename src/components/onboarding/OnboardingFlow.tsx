
import React, { useState } from 'react';
import OnboardingSlide from './OnboardingSlide';
import { Car, MapPin, Smartphone, Shield, Clock } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: (
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-300 rounded-full flex items-center justify-center shadow-xl">
            <div className="w-20 h-20 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg relative">
              <Car className="h-10 w-10 text-white" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      ),
      title: "Car Wash at Your Location",
      description: "Professional car washing service that comes to you. Schedule a wash at your home, office, or anywhere convenient."
    },
    {
      icon: (
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-300 rounded-full flex items-center justify-center shadow-xl">
            <div className="w-20 h-20 bg-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      ),
      title: "Book in Seconds",
      description: "Select your service, choose your time, and book instantly. Track your service provider in real-time."
    },
    {
      icon: (
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-300 rounded-full flex items-center justify-center shadow-xl">
            <div className="w-20 h-20 bg-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      ),
      title: "Trusted & Secure",
      description: "All service providers are verified professionals. Your payments are secure and your satisfaction is guaranteed."
    },
    {
      icon: (
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-orange-300 rounded-full flex items-center justify-center shadow-xl">
            <div className="w-20 h-20 bg-orange-700 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      ),
      title: "Quick & Convenient",
      description: "Save time with our efficient service. No more driving to car washes or waiting in lines."
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <OnboardingSlide
      icon={slides[currentSlide].icon}
      title={slides[currentSlide].title}
      description={slides[currentSlide].description}
      currentSlide={currentSlide}
      totalSlides={slides.length}
      onNext={handleNext}
      onSkip={handleSkip}
      isLastSlide={currentSlide === slides.length - 1}
    />
  );
};

export default OnboardingFlow;
