
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Building2, MapPin, Check } from 'lucide-react';

interface ConfirmLocationProps {
  address: string;
  onConfirm: (addressType: string) => void;
  onEdit: () => void;
}

const ConfirmLocation = ({ address, onConfirm, onEdit }: ConfirmLocationProps) => {
  const [selectedType, setSelectedType] = useState<string>('home');

  const addressTypes = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'work', label: 'Work', icon: Building2 },
    { id: 'other', label: 'Other', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 pt-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Confirm Your Location
        </h1>
        <p className="text-gray-600">
          Make sure this is the correct address for your service
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="mx-6 mb-6">
        <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Interactive map would be here</p>
            <p className="text-xs">Drag pin to adjust location</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="px-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-emerald-500 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{address}</p>
                <Button
                  variant="link"
                  onClick={onEdit}
                  className="text-emerald-600 p-0 h-auto text-sm"
                >
                  Edit address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Type Selection */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Save this address as
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {addressTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "default" : "outline"}
                onClick={() => setSelectedType(type.id)}
                className={`h-20 flex flex-col items-center space-y-2 ${
                  selectedType === type.id 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{type.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="mt-auto p-6">
        <Button
          onClick={() => onConfirm(selectedType)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl"
        >
          <Check className="mr-2 h-5 w-5" />
          Confirm Location
        </Button>
      </div>
    </div>
  );
};

export default ConfirmLocation;
