
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Building2, Mail, Wrench } from 'lucide-react'; // Fixed: added Wrench

interface MobileFrontPageProps {
  onUserTypeSelect: (userType: 'customer' | 'provider') => void;
}

const MobileFrontPage = ({ onUserTypeSelect }: MobileFrontPageProps) => {
  const handleCustomerSelect = () => {
    onUserTypeSelect('customer');
  };

  const handleProviderSelect = () => {
    onUserTypeSelect('provider');
  };

  const handleMechanicRegister = () => {
    window.location.href = '/mechanic-signup';
  };

  const handleEmailLogin = () => {
    onUserTypeSelect('customer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex flex-col">
      <div className="flex-1 px-6 pt-16 pb-8 flex flex-col">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-700 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Car className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-blue-900 mb-3">WashCart</h1>
          <p className="text-gray-600 text-lg font-medium">Your Vehicle Service, On-Demand</p>
        </div>

        {/* User Type Selection */}
        <div className="space-y-6 mb-8 flex-1">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Join as</h2>
          
          <Card className="shadow-lg border-2 border-transparent hover:border-blue-200 transition-all">
            <CardContent className="p-6">
              <Button
                onClick={handleCustomerSelect}
                className="w-full h-20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg touch-manipulation"
              >
                <div className="flex items-center space-x-4">
                  <Car className="h-8 w-8" />
                  <div className="text-left">
                    <div className="text-xl font-bold">Customer</div>
                    <div className="text-blue-100 text-sm">Book car wash services</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-transparent hover:border-blue-200 transition-all">
            <CardContent className="p-6">
              <Button
                onClick={handleProviderSelect}
                variant="outline"
                className="w-full h-20 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl touch-manipulation"
              >
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8" />
                  <div className="text-left">
                    <div className="text-xl font-bold">Service Provider</div>
                    <div className="text-blue-600 text-sm">Offer car wash services</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Mechanic Register Option */}
          <Card className="shadow-lg border-2 border-transparent hover:border-blue-200 transition-all">
            <CardContent className="p-6">
              <Button
                onClick={handleMechanicRegister}
                variant="outline"
                className="w-full h-20 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 rounded-xl touch-manipulation"
              >
                <div className="flex items-center space-x-4">
                  <Wrench className="h-8 w-8" />
                  <div className="text-left">
                    <div className="text-xl font-bold">Register as Mechanic</div>
                    <div className="text-orange-600 text-sm">Offer mechanic services individually</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sign In Options */}
        <div className="space-y-4">
          <div className="text-center text-gray-500 text-sm mb-4">
            Already have an account?
          </div>
          
          <Button
            onClick={handleEmailLogin}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center space-x-3 touch-manipulation"
          >
            <Mail className="h-6 w-6" />
            <span className="text-lg font-semibold">Sign In with Email</span>
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center mt-8">
          By continuing, you agree to our{' '}
          <span className="text-blue-600 underline font-semibold">Terms of Service</span>{' '}
          and{' '}
          <span className="text-blue-600 underline font-semibold">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default MobileFrontPage;

