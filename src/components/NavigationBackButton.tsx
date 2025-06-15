
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NavigationBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Always show back button now
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="mr-2 text-emerald-400 hover:text-white"
      aria-label="Go back"
    >
      <ArrowLeft className="h-6 w-6" />
    </Button>
  );
};

export default NavigationBackButton;
