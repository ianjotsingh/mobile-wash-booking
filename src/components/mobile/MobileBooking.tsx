
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Car, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import LocationPicker from '@/components/LocationPicker';

interface BookingFormData {
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  carType: string;
  carModel: string;
  carColor: string;
  specialInstructions: string;
  address: string;
  city: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

const MobileBooking = () => {
  const [step, setStep] = useState<'service' | 'datetime' | 'vehicle' | 'location' | 'review'>('service');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: '',
    bookingDate: '',
    bookingTime: '',
    carType: '',
    carModel: '',
    carColor: '',
    specialInstructions: '',
    address: '',
    city: '',
    zipCode: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
    // Check if service was pre-selected
    const storedService = localStorage.getItem('selectedService');
    if (storedService) {
      try {
        const service = JSON.parse(storedService);
        setSelectedService(service);
        setFormData(prev => ({ ...prev, serviceType: service.name }));
        setStep('datetime');
        localStorage.removeItem('selectedService');
      } catch (error) {
        console.error('Error parsing stored service:', error);
      }
    }
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('popular', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setFormData(prev => ({ ...prev, serviceType: service.name }));
    setStep('datetime');
  };

  const handleLocationSelect = (location: any) => {
    setFormData(prev => ({
      ...prev,
      address: location.address || '',
      city: location.city || '',
      zipCode: location.zipCode || '',
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };

  const handleSubmitBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a service",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            service_type: formData.serviceType,
            booking_date: formData.bookingDate,
            booking_time: formData.bookingTime,
            car_type: formData.carType,
            car_model: formData.carModel,
            car_color: formData.carColor,
            special_instructions: formData.specialInstructions,
            address: formData.address,
            city: formData.city,
            zip_code: formData.zipCode,
            latitude: formData.latitude,
            longitude: formData.longitude,
            total_amount: selectedService?.price || 0,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your car wash has been scheduled successfully.",
      });

      // Reset form
      setStep('service');
      setSelectedService(null);
      setFormData({
        serviceType: '',
        bookingDate: '',
        bookingTime: '',
        carType: '',
        carModel: '',
        carColor: '',
        specialInstructions: '',
        address: '',
        city: '',
        zipCode: ''
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInPaise: number): string => {
    return `₹${Math.floor(priceInPaise / 100)}`;
  };

  const getAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour}:00`);
      if (hour < 17) slots.push(`${hour}:30`);
    }
    return slots;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const canProceed = () => {
    switch (step) {
      case 'service':
        return selectedService !== null;
      case 'datetime':
        return formData.bookingDate && formData.bookingTime;
      case 'vehicle':
        return formData.carType && formData.carModel && formData.carColor;
      case 'location':
        return formData.address && formData.city;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        {step !== 'service' && (
          <Button
            variant="ghost"
            onClick={() => {
              const steps = ['service', 'datetime', 'vehicle', 'location', 'review'];
              const currentIndex = steps.indexOf(step);
              if (currentIndex > 0) {
                setStep(steps[currentIndex - 1] as any);
              }
            }}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${
              step === 'service' ? 20 :
              step === 'datetime' ? 40 :
              step === 'vehicle' ? 60 :
              step === 'location' ? 80 : 100
            }%` 
          }}
        ></div>
      </div>

      {/* Service Selection */}
      {step === 'service' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Select a Service</h2>
          {services.map((service) => (
            <Card 
              key={service.id}
              className={`cursor-pointer transition-all ${
                selectedService?.id === service.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      {service.popular && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    <p className="text-sm text-gray-500 mt-1">{service.duration} minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{formatPrice(service.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Date & Time Selection */}
      {step === 'datetime' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Select Date & Time</h2>
          
          <div>
            <Label htmlFor="date">Booking Date</Label>
            <Input
              id="date"
              type="date"
              min={getTomorrowDate()}
              value={formData.bookingDate}
              onChange={(e) => setFormData(prev => ({ ...prev, bookingDate: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Available Time Slots</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {getAvailableTimeSlots().map((time) => (
                <Button
                  key={time}
                  variant={formData.bookingTime === time ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, bookingTime: time }))}
                  className="text-sm"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details */}
      {step === 'vehicle' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Vehicle Details</h2>
          
          <div>
            <Label htmlFor="carType">Car Type</Label>
            <select
              id="carType"
              value={formData.carType}
              onChange={(e) => setFormData(prev => ({ ...prev, carType: e.target.value }))}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select car type</option>
              <option value="hatchback">Hatchback</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div>
            <Label htmlFor="carModel">Car Model</Label>
            <Input
              id="carModel"
              placeholder="e.g., Honda City, Maruti Swift"
              value={formData.carModel}
              onChange={(e) => setFormData(prev => ({ ...prev, carModel: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="carColor">Car Color</Label>
            <Input
              id="carColor"
              placeholder="e.g., White, Black, Red"
              value={formData.carColor}
              onChange={(e) => setFormData(prev => ({ ...prev, carColor: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="instructions">Special Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Any special requirements or notes..."
              value={formData.specialInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Location Selection */}
      {step === 'location' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Service Location</h2>
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            initialAddress={formData.address}
            initialCity={formData.city}
            initialZipCode={formData.zipCode}
          />
        </div>
      )}

      {/* Review & Confirm */}
      {step === 'review' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Review Booking</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{formData.bookingDate} at {formData.bookingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">{formData.carColor} {formData.carModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{formData.address}, {formData.city}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">{formatPrice(selectedService?.price || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmitBooking}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Confirming Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      )}

      {/* Continue Button */}
      {step !== 'review' && (
        <div className="fixed bottom-4 left-4 right-4">
          <Button
            onClick={() => {
              const steps = ['service', 'datetime', 'vehicle', 'location', 'review'];
              const currentIndex = steps.indexOf(step);
              if (currentIndex < steps.length - 1) {
                setStep(steps[currentIndex + 1] as any);
              }
            }}
            disabled={!canProceed()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileBooking;
