
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Car, MapPin, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WashBookingFlow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    carType: '',
    address: '',
    timeSlot: ''
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

  const handleSeeProviders = () => {
    // Navigate to provider list page (you can customize this route)
    navigate('/wash-providers', { state: { bookingDetails: formData } });
  };

  const isFormValid = formData.carType && formData.address && formData.timeSlot;

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
          <h1 className="text-2xl font-bold text-gray-900">Book Wash Service</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
              1
            </div>
            <span className="ml-2 text-sm font-medium text-blue-600">Details</span>
          </div>
          
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-500 rounded-full text-sm font-medium">
              2
            </div>
            <span className="ml-2 text-sm text-gray-500">Providers</span>
          </div>
          
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-500 rounded-full text-sm font-medium">
              3
            </div>
            <span className="ml-2 text-sm text-gray-500">Confirm</span>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-600" />
            <span>Booking Details</span>
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

          {/* Address */}
          <div>
            <Label htmlFor="address">Service Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your service address"
                className="pl-10"
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

          {/* See Available Companies Button */}
          <Button
            onClick={handleSeeProviders}
            disabled={!isFormValid}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            See Available Wash Companies
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WashBookingFlow;
