
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
    <div className="min-h-screen bg-gradient-to-b from-[#E6F0FF] via-white to-white flex flex-col relative">
      {/* Skip Button */}
      <div className="absolute top-0 right-0 z-10 pt-10 pr-6">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-blue-400 text-base font-semibold hover:bg-blue-100 rounded-full px-4 py-1"
        >
          Skip
        </Button>
      </div>

      {/* Content Card */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-white bg-opacity-90 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
          {/* Icon */}
          <div className="mb-12 active:scale-105 transition-transform">{icon}</div>
          {/* Title */}
          <h1 className="text-3xl font-extrabold text-blue-900 text-center mb-3">{title}</h1>
          {/* Description */}
          <p className="text-base text-gray-500 text-center px-2 mb-10 leading-relaxed">{description}</p>
          {/* Dots Indicator */}
          <div className="flex items-center space-x-2 justify-center mb-7">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <span
                key={index}
                className={`block h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'w-7 bg-blue-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
          {/* Next/Get Started Button */}
          <Button
            onClick={onNext}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-extrabold text-lg flex justify-center items-center gap-2 transition-all shadow"
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
