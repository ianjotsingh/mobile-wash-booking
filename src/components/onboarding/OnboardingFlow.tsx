
import React, { useState } from 'react';
import OnboardingSlide from './OnboardingSlide';
import { Car, MapPin, Shield } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: (
        <div className="relative">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Car className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
        </div>
      ),
      title: "Car Wash at Your Location",
      description: "Professional car washing service that comes to you. Schedule a wash at your home, office, or anywhere convenient."
    },
    {
      icon: (
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
          <Shield className="h-10 w-10 text-white" />
        </div>
      ),
      title: "Trusted Professionals",
      description: "All our service providers are verified and trained professionals who deliver quality service you can trust."
    },
    {
      icon: (
        <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
          <MapPin className="h-10 w-10 text-white" />
        </div>
      ),
      title: "Track Your Service",
      description: "Get real-time updates on your service provider's location and estimated arrival time."
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
