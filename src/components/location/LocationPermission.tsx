
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface LocationPermissionProps {
  onPermissionGranted: (location: { lat: number; lng: number }) => void;
  onManualEntry: () => void;
}

const LocationPermission = ({ onPermissionGranted, onManualEntry }: LocationPermissionProps) => {
  const [requesting, setRequesting] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Automatically try to detect location when component mounts
  useEffect(() => {
    autoDetectLocation();
  }, []);

  const autoDetectLocation = async () => {
    if (!navigator.geolocation) {
      setAutoDetecting(false);
      setLocationError('Geolocation is not supported by this browser.');
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
    } catch (error: any) {
      console.error('Auto location detection failed:', error);
      setAutoDetecting(false);
      
      // Set user-friendly error message based on error type
      if (error.code === 1) {
        setLocationError('Location access denied. Please enable location access for the best experience.');
      } else if (error.code === 2) {
        setLocationError('Location information unavailable. Please check your connection.');
      } else if (error.code === 3) {
        setLocationError('Location request timed out. Please try again.');
      } else {
        setLocationError('Unable to detect your location automatically.');
      }
    }
  };

  const requestLocation = async () => {
    setRequesting(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setRequesting(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        });
      });

      onPermissionGranted({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error: any) {
      console.error('Error getting location:', error);
      if (error.code === 1) {
        setLocationError('Location access denied. Please allow location access in your browser settings.');
      } else {
        setLocationError('Unable to get your location. Please try manual entry.');
      }
    } finally {
      setRequesting(false);
    }
  };

  // Show loading state while auto-detecting
  if (autoDetecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-white flex flex-col">
        <div className="flex-1 px-4 pt-8 pb-4 flex items-center justify-center">
          <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl mx-auto max-w-sm w-full p-10 text-center">
            {/* Loading Icon */}
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-blue-50 shadow">
              <Loader2 className="h-16 w-16 text-blue-700 animate-spin" />
            </div>
            {/* Title */}
            <h1 className="text-2xl font-extrabold text-blue-800 mb-2">
              Detecting Your Location
            </h1>
            {/* Description */}
            <p className="text-gray-500 text-base leading-relaxed mb-4">
              We're automatically finding your location to provide you with the best service experience.
            </p>
            <p className="text-gray-400 text-sm">
              This may take a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            {locationError || "We need your location to find nearby service providers and give you accurate delivery times."}
          </p>
          
          {/* Error message if any */}
          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-600 text-sm">{locationError}</p>
            </div>
          )}
          
          {/* Buttons */}
          <div className="space-y-4">
            <Button
              onClick={requestLocation}
              disabled={requesting}
              className="w-full bg-blue-700 hover:bg-blue-900 text-white h-14 rounded-2xl font-extrabold flex items-center justify-center gap-2"
            >
              {requesting ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-6 w-6" />
                  Try Again
                </>
              )}
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
