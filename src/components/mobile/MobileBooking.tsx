
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Car, MapPin, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import EnhancedLocationSelector from '@/components/EnhancedLocationSelector';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MobileBooking = () => {
  const [serviceType, setServiceType] = useState('');
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    city: string;
    zipCode: string;
  } | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [bookingTime, setBookingTime] = useState('');
  const [carType, setCarType] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carModel, setCarModel] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBooking = async () => {
    console.log('=== BOOKING DEBUG START ===');
    console.log('User:', user);
    console.log('Location data:', location);
    console.log('Service type:', serviceType);
    console.log('All form data:', {
      serviceType,
      location,
      bookingDate,
      bookingTime,
      carType,
      carColor,
      carModel,
      specialInstructions
    });
    
    if (!user) {
      console.log('❌ No user authenticated');
      toast({
        title: "Authentication Required",
        description: "Please login to book a service",
        variant: "destructive"
      });
      return;
    }

    if (!serviceType || !location || !bookingDate || !bookingTime || !carType || !carColor || !carModel) {
      console.log('❌ Missing required fields');
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        service_type: serviceType,
        address: location.address,
        city: location.city,
        zip_code: location.zipCode,
        latitude: location.lat,
        longitude: location.lng,
        booking_date: format(bookingDate, 'yyyy-MM-dd'),
        booking_time: bookingTime,
        car_type: carType,
        car_color: carColor,
        car_model: carModel,
        special_instructions: specialInstructions || null,
        total_amount: 0,
        status: 'pending'
      };

      console.log('🚀 Creating order with data:', orderData);

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Order created successfully:', data);

      toast({
        title: "Booking Created Successfully!",
        description: `Your ${serviceType} booking has been created. Companies will send quotes soon.`
      });

      // Reset form
      setServiceType('');
      setLocation(null);
      setBookingDate(undefined);
      setBookingTime('');
      setCarType('');
      setCarColor('');
      setCarModel('');
      setSpecialInstructions('');
      
      console.log('=== BOOKING DEBUG END ===');
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !bookingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={(date) => date < today}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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
