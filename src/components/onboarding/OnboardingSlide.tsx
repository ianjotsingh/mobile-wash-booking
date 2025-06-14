
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface OnboardingSlideProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  currentSlide: number;
  totalSlides: number;
  onNext: () => void;
  onSkip: () => void;
  isLastSlide?: boolean;
}

const OnboardingSlide = ({
  icon,
  title,
  description,
  currentSlide,
  totalSlides,
  onNext,
  onSkip,
  isLastSlide = false
}: OnboardingSlideProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col relative">
      {/* Skip Button */}
      <div className="flex justify-end px-6 pt-10 absolute top-0 right-0 z-10">
        <Button variant="ghost" onClick={onSkip} className="text-blue-400 text-base font-semibold hover:bg-blue-100 rounded-full py-1 px-4">
          Skip
        </Button>
      </div>

      {/* Content Card */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-white bg-opacity-90 rounded-3xl shadow-lg p-8 flex flex-col items-center">
          {/* Icon */}
          <div className="mb-10">
            {icon}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-blue-950 mb-4">{title}</h1>
          {/* Description */}
          <p className="text-gray-500 text-center text-base px-1 mb-10 leading-relaxed">{description}</p>
          
          {/* Dots Indicator */}
          <div className="flex items-center space-x-2 justify-center mb-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <span
                key={index}
                className={`block h-2 rounded-full transition-all duration-200 ${index === currentSlide ? 'w-6 bg-blue-500' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <Button
            onClick={onNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold text-base flex justify-center items-center gap-2"
          >
            {isLastSlide ? 'Get Started' : 'Next'}
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlide;
