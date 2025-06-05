
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
  price: string;
  features: string[];
  duration: string;
  popular?: boolean;
}

const ServiceCard = ({ title, description, price, features, duration, popular }: ServiceCardProps) => {
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
      <Card className={`relative bg-gray-800 border-gray-700 text-white cursor-pointer hover:bg-gray-750 transition-colors ${popular ? 'ring-2 ring-emerald-400' : ''}`} onClick={handleBookNow}>
        {popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-emerald-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-emerald-400">{title}</CardTitle>
          <p className="text-gray-400">{description}</p>
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-white">{price}</span>
            <div className="flex items-center text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>{duration}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            className={`w-full ${popular ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600'} text-white font-semibold`}
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow();
            }}
          >
            Book Now
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
