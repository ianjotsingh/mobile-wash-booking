
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NavigationBackButton = () => {
  const navigate = useNavigate();

  // Always show back button, styled as black
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="mr-2 text-black hover:text-gray-700"
      aria-label="Go back"
    >
      <ArrowLeft className="h-6 w-6" color="black" />
    </Button>
  );
};

export default NavigationBackButton;
