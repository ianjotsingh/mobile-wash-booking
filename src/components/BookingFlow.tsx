import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { MapPin, Calendar as CalendarIcon, Clock, Car, User, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import LocationPicker from './LocationPicker';
import ServiceProviderSelector from './ServiceProviderSelector';
import PricingDisplay from './payment/PricingDisplay';
import { Location } from '@/utils/locationService';
import { calculateServicePrice, PricingBreakdown } from '@/utils/pricingCalculator';
import { supabase } from '@/integrations/supabase/client';

interface ServiceProvider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  estimatedArrival: string;
  specializations?: string[];
  avatar?: string;
}

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [promoCode, setPromoCode] = useState('');
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [bookingData, setBookingData] = useState({
    address: '',
    city: '',
    zipCode: '',
    specialInstructions: '',
    carType: '',
    carColor: '',
    carModel: '',
    problemDescription: '',
    urgencyLevel: 'standard'
  });
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const steps = [
    { number: 1, title: 'Service & Location', icon: MapPin },
    { number: 2, title: 'Date & Time', icon: CalendarIcon },
    { number: 3, title: 'Provider & Details', icon: User },
    { number: 4, title: 'Review & Payment', icon: Clock }
  ];

  // Load selected service from localStorage with proper error handling
  useEffect(() => {
    try {
      const storedService = localStorage.getItem('selectedService');
      console.log('Stored service from localStorage:', storedService);
      
      if (storedService) {
        // Check if the stored data looks like valid JSON
        if (storedService.startsWith('{') && storedService.endsWith('}')) {
          const service = JSON.parse(storedService);
          console.log('Parsed service:', service);
          setSelectedService(service);
          
          // Calculate initial pricing
          if (service.category) {
            const initialPricing = calculateServicePrice(service.id, service.category);
            setPricing(initialPricing);
          }
        } else {
          console.error('Invalid JSON format in localStorage:', storedService);
          // Clear the invalid data
          localStorage.removeItem('selectedService');
        }
      }
    } catch (error) {
      console.error('Error parsing selectedService from localStorage:', error);
      // Clear the corrupted data
      localStorage.removeItem('selectedService');
      toast({
        title: "Error",
        description: "Failed to load selected service. Please select a service again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Update pricing when promo code changes
  useEffect(() => {
    if (selectedService) {
      const newPricing = calculateServicePrice(
        selectedService.id, 
        selectedService.category, 
        promoCode || undefined
      );
      setPricing(newPricing);
    }
  }, [promoCode, selectedService]);

  // Load service providers when location is selected
  useEffect(() => {
    if (selectedLocation && selectedService) {
      loadServiceProviders();
    }
  }, [selectedLocation, selectedService]);

  const loadServiceProviders = async () => {
    // Mock data for now - in real app, this would filter by location and service type
    const mockProviders: ServiceProvider[] = [
      {
        id: '1',
        name: selectedService.category === 'wash' ? 'Premium Car Wash Co.' : 'Expert Auto Mechanics',
        rating: 4.8,
        reviewCount: 156,
        distance: 2.3,
        estimatedArrival: '25-30 mins',
        specializations: selectedService.category === 'wash' 
          ? ['Premium Wash', 'Detailing', 'Interior Cleaning']
          : ['Engine Repair', 'Brake Service', 'AC Repair']
      },
      {
        id: '2',
        name: selectedService.category === 'wash' ? 'Quick Shine Services' : 'Roadside Heroes',
        rating: 4.6,
        reviewCount: 89,
        distance: 3.1,
        estimatedArrival: '35-40 mins',
        specializations: selectedService.category === 'wash'
          ? ['Basic Wash', 'Quick Service']
          : ['Emergency Repair', 'Tire Service', 'Battery Service']
      },
      {
        id: '3',
        name: selectedService.category === 'wash' ? 'Eco Wash Solutions' : 'Pro Mechanics Hub',
        rating: 4.9,
        reviewCount: 203,
        distance: 1.8,
        estimatedArrival: '20-25 mins',
        specializations: selectedService.category === 'wash'
          ? ['Eco-Friendly', 'Full Detailing', 'Premium Service']
          : ['Diagnostics', 'Oil Change', 'General Maintenance']
      }
    ];
    
    setServiceProviders(mockProviders);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setBookingData(prev => ({
      ...prev,
      address: location.address || '',
      city: location.city || '',
      zipCode: location.zipCode || ''
    }));
  };

  const handleNext = () => {
    if (step === 4 && !user) {
      setShowAuthModal(true);
      return;
    }
    
    if (step === 4 && user) {
      handleBookingSubmit();
      return;
    }
    
    setStep(Math.min(4, step + 1));
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        user_id: user.id,
        service_type: selectedService?.title || 'Service',
        address: bookingData.address,
        city: bookingData.city,
        zip_code: bookingData.zipCode,
        booking_date: selectedDate?.toISOString().split('T')[0],
        booking_time: selectedTime,
        car_type: bookingData.carType || 'Not specified',
        car_color: bookingData.carColor || 'Not specified',
        car_model: bookingData.carModel || 'Not specified',
        special_instructions: bookingData.specialInstructions,
        total_amount: pricing?.total || 0,
        status: 'pending',
        latitude: selectedLocation?.latitude || null,
        longitude: selectedLocation?.longitude || null
      };

      // Add mechanic-specific fields if it's a mechanic service
      if (selectedService?.category === 'mechanic') {
        // Would insert into mechanic_requests table instead
        const { data, error } = await supabase
          .from('mechanic_requests')
          .insert({
            user_id: user.id,
            problem_description: bookingData.problemDescription || 'General service request',
            car_model: bookingData.carModel,
            phone: user.phone || 'Not provided',
            address: bookingData.address,
            city: bookingData.city,
            zip_code: bookingData.zipCode,
            status: 'pending'
          });

        if (error) throw error;
      } else {
        // Car wash service
        const { data, error } = await supabase
          .from('orders')
          .insert(orderData);

        if (error) throw error;
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your ${selectedService?.title} has been scheduled successfully.`
      });
      
      navigate('/order-history');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    if (step === 1) {
      return bookingData.address && bookingData.city && bookingData.zipCode;
    }
    if (step === 2) {
      return selectedDate && selectedTime;
    }
    if (step === 3) {
      if (selectedService?.category === 'wash') {
        return bookingData.carType && bookingData.carColor && bookingData.carModel;
      } else {
        return bookingData.problemDescription && bookingData.carModel;
      }
    }
    return true;
  };

  if (!selectedService) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">No Service Selected</h3>
            <p className="text-gray-400 mb-6">Please select a service from the home page first.</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-4 text-white">
          Book {selectedService.title}
        </h2>
        
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.number;
              const isCompleted = step > stepItem.number;
              
              return (
                <div key={stepItem.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isActive ? 'bg-emerald-500 border-emerald-500 text-black' :
                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-black' :
                    'border-gray-600 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 font-medium ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {stepItem.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Booking Flow */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Service & Location</h3>
                    <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4">
                      <p className="text-emerald-400">Selected: {selectedService.title}</p>
                      <p className="text-emerald-300 text-sm">{selectedService.description}</p>
                    </div>
                  </div>
                  
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialAddress={bookingData.address}
                    initialCity={bookingData.city}
                    initialZipCode={bookingData.zipCode}
                  />
                  
                  <div>
                    <Label htmlFor="instructions" className="text-white">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any specific instructions for the service provider..."
                      className="mt-2 bg-gray-800 border-gray-600 text-white"
                      value={bookingData.specialInstructions}
                      onChange={(e) => setBookingData({...bookingData, specialInstructions: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Select Date & Time</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block text-white">Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border border-gray-600 bg-gray-800"
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                    <div>
                      <Label className="text-lg font-semibold mb-4 block text-white">Select Time Slot</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className={`justify-center ${
                              selectedTime === time 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-black' 
                                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Service Provider & Details</h3>
                  
                  {serviceProviders.length > 0 && (
                    <div className="mb-6">
                      <Label className="text-white mb-3 block">Choose Service Provider</Label>
                      <ServiceProviderSelector
                        providers={serviceProviders}
                        selectedProvider={selectedProvider}
                        onProviderSelect={setSelectedProvider}
                      />
                    </div>
                  )}

                  {selectedService?.category === 'wash' ? (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Vehicle Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="carType" className="text-white">Car Type</Label>
                          <select
                            className="w-full mt-2 p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
                            value={bookingData.carType}
                            onChange={(e) => setBookingData({...bookingData, carType: e.target.value})}
                          >
                            <option value="">Select car type</option>
                            <option value="sedan">Sedan</option>
                            <option value="suv">SUV</option>
                            <option value="hatchback">Hatchback</option>
                            <option value="truck">Truck</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="carColor" className="text-white">Car Color</Label>
                          <Input
                            id="carColor"
                            placeholder="Car color"
                            className="mt-2 bg-gray-800 border-gray-600 text-white"
                            value={bookingData.carColor}
                            onChange={(e) => setBookingData({...bookingData, carColor: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="carModel" className="text-white">Car Make & Model</Label>
                        <Input
                          id="carModel"
                          placeholder="e.g., Toyota Camry 2020"
                          className="mt-2 bg-gray-800 border-gray-600 text-white"
                          value={bookingData.carModel}
                          onChange={(e) => setBookingData({...bookingData, carModel: e.target.value})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">Problem Description</h4>
                      <div>
                        <Label htmlFor="problemDescription" className="text-white">Describe the Issue</Label>
                        <Textarea
                          id="problemDescription"
                          placeholder="Please describe the problem with your vehicle in detail..."
                          className="mt-2 bg-gray-800 border-gray-600 text-white min-h-[100px]"
                          value={bookingData.problemDescription}
                          onChange={(e) => setBookingData({...bookingData, problemDescription: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="carModel" className="text-white">Vehicle Make & Model</Label>
                        <Input
                          id="carModel"
                          placeholder="e.g., Honda Civic 2019"
                          className="mt-2 bg-gray-800 border-gray-600 text-white"
                          value={bookingData.carModel}
                          onChange={(e) => setBookingData({...bookingData, carModel: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-white">Urgency Level</Label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                          <Button
                            variant={bookingData.urgencyLevel === 'standard' ? "default" : "outline"}
                            onClick={() => setBookingData({...bookingData, urgencyLevel: 'standard'})}
                            className={bookingData.urgencyLevel === 'standard' 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-black' 
                              : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            }
                          >
                            Standard
                          </Button>
                          <Button
                            variant={bookingData.urgencyLevel === 'emergency' ? "default" : "outline"}
                            onClick={() => setBookingData({...bookingData, urgencyLevel: 'emergency'})}
                            className={bookingData.urgencyLevel === 'emergency' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            }
                          >
                            Emergency
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                      <p className="text-yellow-400 text-center">
                        Please login or sign up to complete your booking
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Review & Confirm</h3>
                  <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white ml-2">{selectedService.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white ml-2">{selectedDate?.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white ml-2">{selectedTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Provider:</span>
                        <span className="text-white ml-2">{selectedProvider?.name || 'Any available'}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-600 pt-4">
                      <span className="text-gray-400">Location:</span>
                      <p className="text-white">{bookingData.address}, {bookingData.city}</p>
                    </div>

                    {bookingData.specialInstructions && (
                      <div className="border-t border-gray-600 pt-4">
                        <span className="text-gray-400">Special Instructions:</span>
                        <p className="text-white">{bookingData.specialInstructions}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="promoCode" className="text-white">Promo Code (Optional)</Label>
                    <Input
                      id="promoCode"
                      placeholder="Enter promo code"
                      className="mt-2 bg-gray-800 border-gray-600 text-white"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={loading || !canProceedToNextStep()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black"
                >
                  {loading ? 'Processing...' : 
                   step === 4 ? (user ? 'Confirm Booking' : 'Login to Continue') : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Sidebar */}
        <div className="lg:col-span-1">
          {pricing && (
            <PricingDisplay 
              pricing={pricing} 
              promoCode={promoCode || undefined}
            />
          )}
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </div>
  );
};

export default BookingFlow;
