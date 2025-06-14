
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
  const [selectedType, setSelectedType] = useState<string>('work');

  const addressTypes = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'work', label: 'Work', icon: Building2 },
    { id: 'other', label: 'Other', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 px-6 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 mx-auto max-w-sm">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              Confirm Your Location
            </h1>
            
            {/* Address Display */}
            <div className="flex items-start space-x-3 mb-6">
              <MapPin className="h-5 w-5 text-blue-500 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">456 Business Park</p>
                <p className="text-gray-600">BKC, Mumbai</p>
              </div>
            </div>
          </div>

          {/* Address Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save this address as:
            </h3>
            <div className="flex space-x-3">
              {addressTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex-1 p-3 rounded-full border-2 transition-colors ${
                      selectedType === type.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon className={`h-4 w-4 ${selectedType === type.id ? 'text-blue-500' : 'text-gray-500'}`} />
                      <span className={`text-sm ${selectedType === type.id ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                        {type.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mb-8">
            <div className="h-48 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-gray-500 text-center">Interactive map would be here</p>
              <p className="text-xs text-gray-400">Drag pin to adjust location</p>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={() => onConfirm(selectedType)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl"
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLocation;
