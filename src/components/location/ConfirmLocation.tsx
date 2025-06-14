
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex flex-col">
      <div className="flex-1 px-4 pt-8 pb-4 flex items-center">
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl max-w-sm mx-auto p-8 w-full">
          {/* Header */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-extrabold text-blue-800 mb-1">
              Confirm Your Location
            </h1>
            <p className="text-gray-500 font-medium mb-2">We'll use this address for your booking</p>
          </div>
          
          {/* Address Display */}
          <div className="flex items-center space-x-3 mb-4 px-2">
            <MapPin className="h-5 w-5 text-blue-400" />
            <div className="flex-1">
              <p className="font-bold text-blue-950">{address || '456 Business Park, BKC, Mumbai'}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-500" onClick={onEdit}>Edit</Button>
          </div>

          {/* Address Type Selection */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Save as:</h3>
            <div className="flex space-x-3">
              {addressTypes.map((type) => {
                const Icon = type.icon;
                const active = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-colors flex flex-col items-center
                      ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium mt-1 ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mb-8">
            <div className="h-44 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-blue-200 gap-2">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow mb-1">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <p className="text-xs text-blue-500 font-semibold">Map preview here</p>
              <span className="text-xs text-gray-400">Drag pin if needed</span>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={() => onConfirm(selectedType)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold text-base"
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLocation;
