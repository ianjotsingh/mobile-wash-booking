
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  duration: string;
  popular?: boolean;
}

const ServiceCard = ({ title, description, features, duration, popular }: ServiceCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBookNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/booking');
  };

  return (
    <>
      <Card className={`relative bg-white border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 ${popular ? 'ring-2 ring-green-400' : ''}`} onClick={handleBookNow}>
        {popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Most Popular
            </span>
          </div>
        )}
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
          <p className="text-gray-600 text-sm">{description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-blue-600">Price on quote</span>
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">{duration}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            className={`w-full ${popular ? 'bg-green-500 hover:bg-green-600' : 'bg-black hover:bg-gray-800'} text-white font-semibold h-11 rounded-xl`}
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow();
            }}
          >
            Get Quote
          </Button>
        </CardContent>
      </Card>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </>
  );
};

export default ServiceCard;
