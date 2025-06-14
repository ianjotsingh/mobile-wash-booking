
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 px-6 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 mx-auto max-w-sm text-center h-full flex flex-col justify-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <MapPin className="h-12 w-12 text-blue-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-blue-600 mb-4">
            Enable Location Access
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg leading-relaxed mb-8 px-4">
            We need your location to find nearby service providers and give you accurate delivery times.
          </p>

          {/* Buttons */}
          <div className="space-y-4">
            <Button
              onClick={requestLocation}
              disabled={requesting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl"
            >
              <Navigation className="mr-2 h-5 w-5" />
              {requesting ? 'Requesting Permission...' : 'Enable Location'}
            </Button>

            <Button
              variant="ghost"
              onClick={onManualEntry}
              className="w-full h-12 rounded-xl text-blue-500"
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
