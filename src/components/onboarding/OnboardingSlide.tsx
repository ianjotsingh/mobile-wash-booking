
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-4 pt-8">
        <Button variant="ghost" onClick={onSkip} className="text-gray-600">
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Icon */}
        <div className="mb-8">
          {icon}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          {description}
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="p-8">
        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mb-8">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={onNext}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl font-semibold"
        >
          {isLastSlide ? 'Get Started' : 'Next'}
          {!isLastSlide && <ChevronRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingSlide;
