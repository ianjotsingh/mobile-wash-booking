
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Wrench, MapPin, Clock, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AuthModal from '@/components/AuthModal';

const MechanicRequestForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleType: '',
    problemDescription: '',
    location: '',
    timeSlot: '',
    phone: ''
  });

  const vehicleTypes = [
    'Car',
    'Motorcycle',
    'Truck',
    'Van',
    'Bus',
    'Heavy Vehicle'
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

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.vehicleType || !formData.problemDescription || !formData.location || !formData.timeSlot || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const requestData = {
        problem_description: formData.problemDescription,
        car_model: formData.vehicleType,
        phone: formData.phone,
        address: formData.location,
        city: '', // Will be extracted if needed
        zip_code: '',
        status: 'pending',
        user_id: user.id
      };

      const { error } = await supabase
        .from('mechanic_requests')
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: "Your mechanic request has been submitted. A mechanic will contact you soon."
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating mechanic request:', error);
      toast({
        title: "Request Failed",
        description: "Unable to submit request. Please try again.",
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
          <Wrench className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">Mechanic Request Form</h1>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            <span>Vehicle Issue Details</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Vehicle Type */}
          <div>
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Select onValueChange={(value) => handleInputChange('vehicleType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Problem Description */}
          <div>
            <Label htmlFor="problemDescription">Problem Description *</Label>
            <Textarea
              id="problemDescription"
              value={formData.problemDescription}
              onChange={(e) => handleInputChange('problemDescription', e.target.value)}
              placeholder="Please describe the issue with your vehicle in detail"
              rows={4}
              required
            />
          </div>

          {/* Upload Photo */}
          <div>
            <Label htmlFor="photo">Upload Photo (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload photos of the issue</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="photo-upload"
              />
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                Choose Files
              </Button>
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <Label htmlFor="phone">Contact Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your contact number"
              required
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter your current location or where the vehicle is located"
                className="pl-10"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Preferred Time Slot */}
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

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardContent>
      </Card>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </div>
  );
};

export default MechanicRequestForm;
