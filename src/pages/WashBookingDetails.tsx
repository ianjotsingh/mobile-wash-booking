
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Car, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AuthModal from '@/components/AuthModal';

const WashBookingDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [formData, setFormData] = useState({
    carType: '',
    carNumber: '',
    address: '',
    timeSlot: '',
    specialInstructions: ''
  });

  const carTypes = [
    'Sedan',
    'SUV',
    'Hatchback',
    'Coupe',
    'Convertible',
    'Wagon',
    'Pickup Truck'
  ];

  const timeSlots = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.carType || !formData.carNumber || !formData.address || !formData.timeSlot) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get tomorrow's date as default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().split('T')[0];

      const orderData = {
        user_id: user.id,
        service_type: 'Car Wash',
        address: formData.address,
        city: '', // Will be extracted from address if needed
        zip_code: '',
        booking_date: defaultDate,
        booking_time: formData.timeSlot.split(' ')[0], // Extract time without AM/PM
        car_type: formData.carType,
        car_model: formData.carNumber,
        car_color: '',
        special_instructions: formData.specialInstructions || null,
        status: 'pending',
        total_amount: 0
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: `Your car wash has been booked for ${formData.timeSlot}.`
      });

      navigate('/order-history');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Wash Booking Details</h1>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-600" />
            <span>Vehicle & Service Details</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Car Type */}
          <div>
            <Label htmlFor="carType">Car Type *</Label>
            <Select onValueChange={(value) => handleInputChange('carType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your car type" />
              </SelectTrigger>
              <SelectContent>
                {carTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Car Number */}
          <div>
            <Label htmlFor="carNumber">Car Number *</Label>
            <Input
              id="carNumber"
              value={formData.carNumber}
              onChange={(e) => handleInputChange('carNumber', e.target.value)}
              placeholder="Enter your car registration number"
              required
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Service Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete address where service is needed"
                className="pl-10"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <Label htmlFor="timeSlot">Preferred Time Slot *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <Select onValueChange={(value) => handleInputChange('timeSlot', value)}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special instructions or requirements"
              rows={3}
            />
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loading ? 'Processing...' : 'Continue Booking'}
          </Button>
        </CardContent>
      </Card>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </div>
  );
};

export default WashBookingDetails;
