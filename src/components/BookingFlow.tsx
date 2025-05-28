
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { MapPin, Calendar as CalendarIcon, Clock, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AuthModal from './AuthModal';

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingData, setBookingData] = useState({
    address: '',
    city: '',
    zipCode: '',
    specialInstructions: '',
    carType: '',
    carColor: '',
    carModel: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const steps = [
    { number: 1, title: 'Location', icon: MapPin },
    { number: 2, title: 'Date & Time', icon: CalendarIcon },
    { number: 3, title: 'Service Details', icon: Car },
    { number: 4, title: 'Confirmation', icon: Clock }
  ];

  const handleBookingSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to complete your booking.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          serviceId: 'premium-wash', // You can make this dynamic
          companyId: null, // Will be assigned automatically
          address: bookingData.address,
          city: bookingData.city,
          zipCode: bookingData.zipCode,
          specialInstructions: bookingData.specialInstructions,
          bookingDate: selectedDate?.toISOString().split('T')[0],
          bookingTime: selectedTime,
          carType: bookingData.carType,
          carColor: bookingData.carColor,
          carModel: bookingData.carModel,
          additionalNotes: bookingData.additionalNotes,
          totalAmount: 59900 // Premium wash price
        }
      });

      if (error) throw error;

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

  if (!user && step > 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">Please login or create an account to continue with your booking.</p>
            <AuthModal>
              <Button className="bg-blue-600 hover:bg-blue-700">Login / Sign Up</Button>
            </AuthModal>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-8">Book Your Car Wash</h2>
        
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
                    isActive ? 'bg-blue-600 border-blue-600 text-white' :
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {stepItem.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="address">Service Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your complete address"
                  className="mt-2"
                  value={bookingData.address}
                  onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="mt-2"
                    value={bookingData.city}
                    onChange={(e) => setBookingData({...bookingData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zipcode">ZIP Code</Label>
                  <Input
                    id="zipcode"
                    placeholder="ZIP Code"
                    className="mt-2"
                    value={bookingData.zipCode}
                    onChange={(e) => setBookingData({...bookingData, zipCode: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific instructions for finding your location..."
                  className="mt-2"
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
                  <Label className="text-lg font-semibold mb-4 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Select Time Slot</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className="justify-center"
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
                  <Label htmlFor="carType">Car Type</Label>
                  <select
                    className="w-full mt-2 p-3 border border-gray-300 rounded-md"
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
                  <Label htmlFor="carColor">Car Color</Label>
                  <Input
                    id="carColor"
                    placeholder="Car color"
                    className="mt-2"
                    value={bookingData.carColor}
                    onChange={(e) => setBookingData({...bookingData, carColor: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="carModel">Car Make & Model</Label>
                <Input
                  id="carModel"
                  placeholder="e.g., Toyota Camry 2020"
                  className="mt-2"
                  value={bookingData.carModel}
                  onChange={(e) => setBookingData({...bookingData, carModel: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any specific requirements or notes..."
                  className="mt-2"
                  value={bookingData.additionalNotes}
                  onChange={(e) => setBookingData({...bookingData, additionalNotes: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Booking Confirmed!</h3>
                <div className="space-y-2 text-green-700">
                  <p><strong>Service:</strong> Premium Car Wash</p>
                  <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Location:</strong> {bookingData.address}, {bookingData.city}</p>
                  <p><strong>Total:</strong> ₹599</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-4">You will receive a confirmation email shortly.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Track Your Booking
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (step === 3) {
                  handleBookingSubmit();
                } else {
                  setStep(Math.min(4, step + 1));
                }
              }}
              disabled={step === 4 || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Processing...' : step === 3 ? 'Confirm Booking' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingFlow;
