
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import UberLikeHero from '@/components/UberLikeHero';
import ServiceSelector from '@/components/ServiceSelector';
import ServiceStats from '@/components/ServiceStats';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <UberLikeHero />
      <ServiceSelector />
      <ServiceStats />
      
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </div>
  );
};

export default Index;
