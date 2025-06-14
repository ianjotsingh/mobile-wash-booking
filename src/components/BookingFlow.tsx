
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';
import CompanyProviderSelector from './CompanyProviderSelector';
import { Card, CardContent } from "@/components/ui/card";

const BookingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'service' | 'providers' | 'details' | 'payment'>('service');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check if service was selected from ServiceSelector
    const storedService = localStorage.getItem('selectedService');
    if (storedService) {
      try {
        const service = JSON.parse(storedService);
        console.log('Loaded selected service:', service);
        setSelectedService(service);
        setCurrentStep('providers');
      } catch (error) {
        console.error('Error parsing stored service:', error);
        setCurrentStep('service');
      }
    }
  }, [user]);

  const handleBackToServices = () => {
    localStorage.removeItem('selectedService');
    navigate('/');
  };

  const handleCompanySelect = (company: any) => {
    console.log('Selected company:', company);
    setSelectedCompany(company);
    setCurrentStep('details');
  };

  const handleBackToProviders = () => {
    setSelectedCompany(null);
    setCurrentStep('providers');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h2>
          <p className="text-gray-600">You need to be logged in to book a service</p>
        </div>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
          <div />
        </AuthModal>
      </div>
    );
  }

  // Show provider selection step
  if (currentStep === 'providers' && selectedService) {
    return (
      <CompanyProviderSelector
        selectedService={selectedService.title || selectedService.name}
        userLocation="Mumbai, India"
        onProviderSelect={handleCompanySelect}
        onBack={handleBackToServices}
      />
    );
  }

  // Show booking details step
  if (currentStep === 'details' && selectedService && selectedCompany) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Selected Service</h3>
                <p className="text-gray-600">{selectedService.title}</p>
                <p className="text-sm text-gray-500">{selectedService.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Service Provider</h3>
                <p className="text-gray-600">{selectedCompany.company_name}</p>
                <p className="text-lg font-bold text-blue-600">{selectedCompany.base_price / 100} ₹</p>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleBackToProviders}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Providers
              </button>
              <button
                onClick={() => setCurrentStep('payment')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a Service</h2>
        <button
          onClick={handleBackToServices}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse Services
        </button>
      </div>
    </div>
  );
};

export default BookingFlow;
