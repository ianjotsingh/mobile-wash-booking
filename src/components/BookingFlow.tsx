
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { MapPin, Calendar as CalendarIcon, Clock, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import LocationPicker from './LocationPicker';
import { Location } from '@/utils/locationService';
import { supabase } from '@/integrations/supabase/client';

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [bookingData, setBookingData] = useState({
    address: '',
    city: '',
    zipCode: '',
    specialInstructions: '',
    carType: '',
    carColor: '',
    carModel: ''
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
    { number: 1, title: 'Location', icon: MapPin },
    { number: 2, title: 'Date & Time', icon: CalendarIcon },
    { number: 3, title: 'Car Details', icon: Car },
    { number: 4, title: 'Confirmation', icon: Clock }
  ];

  // Close auth modal when user logs in
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
      toast({
        title: "Welcome!",
        description: "You're now logged in. Complete your booking below."
      });
    }
  }, [user, showAuthModal, toast]);

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
    if (step === 3 && !user) {
      setShowAuthModal(true);
      return;
    }
    
    if (step === 3 && user) {
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
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_type: 'Premium Wash',
          address: bookingData.address,
          city: bookingData.city,
          zip_code: bookingData.zipCode,
          booking_date: selectedDate?.toISOString().split('T')[0],
          booking_time: selectedTime,
          car_type: bookingData.carType,
          car_color: bookingData.carColor,
          car_model: bookingData.carModel,
          special_instructions: bookingData.specialInstructions,
          total_amount: 59900,
          status: 'pending'
        });

      if (error) {
        console.error('Booking error:', error);
        throw error;
      }

      console.log('Booking successful:', data);
      toast({
        title: "Booking Confirmed!",
        description: "Your car wash has been scheduled successfully."
      });
      
      setStep(4);
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
      return bookingData.carType && bookingData.carColor && bookingData.carModel;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Book Your Car Wash</h2>
        
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

      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6">
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
                  placeholder="Any specific instructions for finding your location..."
                  className="mt-2 bg-gray-800 border-gray-600 text-white"
                  value={bookingData.specialInstructions}
                  onChange={(e) => setBookingData({...bookingData, specialInstructions: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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
                    <option value="truck">Truck</option>
                    <option value="coupe">Coupe</option>
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
              <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-emerald-400 mb-4">Booking Confirmed!</h3>
                <div className="space-y-2 text-emerald-300">
                  <p><strong>Service:</strong> Premium Car Wash</p>
                  <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Location:</strong> {bookingData.address}, {bookingData.city}</p>
                  <p><strong>Total:</strong> ₹599</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-400 mb-4">You will receive a confirmation email shortly.</p>
                <Button 
                  onClick={() => navigate('/order-history')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black"
                >
                  View Order History
                </Button>
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
              disabled={step === 4 || loading || !canProceedToNextStep()}
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              {loading ? 'Processing...' : step === 3 ? (user ? 'Confirm Booking' : 'Login to Continue') : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </div>
  );
};

export default BookingFlow;
