
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Car, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';

const MobileBooking = () => {
  const [serviceType, setServiceType] = useState('');
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    city: string;
    zipCode: string;
  } | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [carType, setCarType] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carModel, setCarModel] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBooking = async () => {
    console.log('Starting booking process...');
    console.log('User:', user);
    console.log('Location:', location);
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book a service",
        variant: "destructive"
      });
      return;
    }

    if (!serviceType || !location || !bookingDate || !bookingTime || !carType || !carColor || !carModel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating order with data:', {
        user_id: user.id,
        service_type: serviceType,
        address: location.address,
        city: location.city,
        zip_code: location.zipCode,
        latitude: location.lat,
        longitude: location.lng,
        booking_date: bookingDate,
        booking_time: bookingTime,
        car_type: carType,
        car_color: carColor,
        car_model: carModel,
        special_instructions: specialInstructions,
        total_amount: 0,
        status: 'pending'
      });

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_type: serviceType,
          address: location.address,
          city: location.city,
          zip_code: location.zipCode,
          latitude: location.lat,
          longitude: location.lng,
          booking_date: bookingDate,
          booking_time: bookingTime,
          car_type: carType,
          car_color: carColor,
          car_model: carModel,
          special_instructions: specialInstructions,
          total_amount: 0,
          status: 'pending'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Order created successfully:', data);

      toast({
        title: "Booking Created",
        description: "Your booking has been created! Service providers will send quotes soon."
      });

      // Reset form
      setServiceType('');
      setLocation(null);
      setBookingDate('');
      setBookingTime('');
      setCarType('');
      setCarColor('');
      setCarModel('');
      setSpecialInstructions('');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Book Car Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic Wash">Basic Wash</SelectItem>
                  <SelectItem value="Premium Wash">Premium Wash</SelectItem>
                  <SelectItem value="Full Detailing">Full Detailing</SelectItem>
                  <SelectItem value="Emergency Roadside">Emergency Roadside</SelectItem>
                  <SelectItem value="Engine Diagnostics">Engine Diagnostics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Location</label>
              <EnhancedLocationSelector
                onLocationSelect={setLocation}
                initialLocation={location}
              />
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={today}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Time</label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Car Details */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehicle Details
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Car Type</label>
                  <Select value={carType} onValueChange={setCarType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Input
                    placeholder="Car color"
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Car Model</label>
                <Input
                  placeholder="e.g., Maruti Swift, Honda City"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Special Instructions (Optional)</label>
              <Textarea
                placeholder="Any specific requirements or notes..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating Booking...' : 'Book Service'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileBooking;
