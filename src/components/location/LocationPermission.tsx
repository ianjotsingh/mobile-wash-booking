import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPermissionProps {
  onPermissionGranted: (location: { lat: number; lng: number }) => void;
  onManualEntry: () => void;
}

const LocationPermission = ({ onPermissionGranted, onManualEntry }: LocationPermissionProps) => {
  const [requesting, setRequesting] = useState(false);

  const requestLocation = async () => {
    setRequesting(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setRequesting(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      onPermissionGranted({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please try manual entry.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex flex-col">
      <div className="flex-1 px-4 pt-8 pb-4 flex items-center justify-center">
        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl mx-auto max-w-sm w-full p-10 text-center">
          {/* Icon */}
          <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-blue-50 shadow">
            <MapPin className="h-16 w-16 text-blue-700" />
          </div>
          {/* Title */}
          <h1 className="text-2xl font-extrabold text-blue-800 mb-2">
            Enable Location Access
          </h1>
          {/* Description */}
          <p className="text-gray-500 text-base leading-relaxed mb-10">
            We need your location to find nearby service providers and give you accurate delivery times.
          </p>
          {/* Buttons */}
          <div className="space-y-4">
            <Button
              onClick={requestLocation}
              disabled={requesting}
              className="w-full bg-blue-700 hover:bg-blue-900 text-white h-14 rounded-2xl font-extrabold flex items-center justify-center gap-2"
            >
              <Navigation className="mr-2 h-6 w-6" />
              {requesting ? 'Requesting Location...' : 'Enable Location'}
            </Button>
            <Button
              variant="ghost"
              onClick={onManualEntry}
              className="w-full h-12 rounded-2xl text-blue-700 font-bold border-blue-100 border shadow-none"
            >
              Enter location manually
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermission;
