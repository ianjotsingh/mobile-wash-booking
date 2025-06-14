
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Phone, Car, Wrench } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AuthModal from '@/components/AuthModal';

interface BookingData {
  serviceType: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  carType?: string;
  carModel?: string;
  carColor?: string;
  issueDescription?: string;
  specialInstructions: string;
  bookingDate: string;
  bookingTime: string;
}

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const serviceType = searchParams.get('service') || 'wash';
  const isWashService = serviceType === 'wash';
  
  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<BookingData>({
    serviceType: isWashService ? 'Car Wash' : 'Mechanic Service',
    name: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    carType: '',
    carModel: '',
    carColor: '',
    issueDescription: '',
    specialInstructions: '',
    bookingDate: defaultDate,
    bookingTime: '10:00'
  });

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  const handleInputChange = (field: keyof BookingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.bookingDate || !formData.bookingTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!isWashService && !formData.issueDescription) {
      toast({
        title: "Missing Information", 
        description: "Please describe the issue for mechanic service",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        user_id: user.id,
        service_type: formData.serviceType,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zipCode || '',
        booking_date: formData.bookingDate,
        booking_time: formData.bookingTime,
        car_type: formData.carType || '',
        car_model: formData.carModel || '',
        car_color: formData.carColor || '',
        special_instructions: formData.specialInstructions || null,
        status: 'pending',
        total_amount: 0 // Will be calculated later
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) throw error;

      // Store customer details in a separate table or use the existing data
      // For now, we'll store phone and name in special_instructions as a workaround
      const updateData = {
        special_instructions: `Customer: ${formData.name}, Phone: ${formData.phone}${formData.specialInstructions ? `, Additional: ${formData.specialInstructions}` : ''}${!isWashService && formData.issueDescription ? `, Issue: ${formData.issueDescription}` : ''}`
      };

      await supabase
        .from('orders')
        .update(updateData)
        .eq('id', data[0].id);

      toast({
        title: "Booking Confirmed!",
        description: `Your ${isWashService ? 'car wash' : 'mechanic'} service has been booked for ${formData.bookingDate} at ${formData.bookingTime}.`
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
          {isWashService ? (
            <Car className="h-6 w-6 text-blue-600" />
          ) : (
            <Wrench className="h-6 w-6 text-orange-600" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            Book {isWashService ? 'Car Wash' : 'Mechanic Service'}
          </h1>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isWashService ? (
              <Car className="h-5 w-5 text-blue-600" />
            ) : (
              <Wrench className="h-5 w-5 text-orange-600" />
            )}
            <span>Service Details</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingDate">Preferred Date *</Label>
                  <Input
                    id="bookingDate"
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                    min={defaultDate}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="bookingTime">Preferred Time *</Label>
                  <Select onValueChange={(value) => handleInputChange('bookingTime', value)} value={formData.bookingTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Service Location</span>
              </h3>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter your city"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="zipCode">Pin Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="Enter pin code"
                  />
                </div>
              </div>
            </div>

            {/* Service Specific Information */}
            {isWashService ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="carType">Car Type</Label>
                    <Select onValueChange={(value) => handleInputChange('carType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select car type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="carModel">Car Model</Label>
                    <Input
                      id="carModel"
                      value={formData.carModel}
                      onChange={(e) => handleInputChange('carModel', e.target.value)}
                      placeholder="e.g., Honda City"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="carColor">Car Color</Label>
                    <Input
                      id="carColor"
                      value={formData.carColor}
                      onChange={(e) => handleInputChange('carColor', e.target.value)}
                      placeholder="e.g., White"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Issue Description</h3>
                
                <div>
                  <Label htmlFor="issueDescription">Describe the Issue *</Label>
                  <Textarea
                    id="issueDescription"
                    value={formData.issueDescription}
                    onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                    placeholder="Please describe the issue with your vehicle in detail"
                    rows={4}
                    required
                  />
                </div>
              </div>
            )}

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

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-12 text-white font-semibold ${
                  isWashService 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading 
                  ? 'Booking...' 
                  : `Book ${isWashService ? 'Car Wash' : 'Mechanic Service'}`
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </div>
  );
};

export default BookingForm;
