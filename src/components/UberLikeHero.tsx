import React, { useState, useEffect } from 'react';
import { MapPin, Navigation2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentLocation, searchLocation, type Location } from '@/utils/locationService';
import { useToast } from '@/hooks/use-toast';

const UberLikeHero = () => {
  const [pickup, setPickup] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { toast } = useToast();

  // Auto-detect location on component mount
  useEffect(() => {
    const autoDetectLocation = async () => {
      // Check if location was already set
      const savedLocation = localStorage.getItem('userLocationSet');
      if (savedLocation) {
        setPickup(savedLocation);
        setLocationDetected(true);
        return;
      }

      setIsDetectingLocation(true);
      try {
        const location = await getCurrentLocation();
        // Use the formatted address from the location service instead of coordinates
        const locationText = location.address || 'Current Location';
        setPickup(locationText);
        setLocationDetected(true);
        
        // Cache the detected location
        localStorage.setItem('userLocationSet', locationText);
        localStorage.setItem('userLocation', JSON.stringify(location));
        
        console.log('Auto-detected location:', locationText);
      } catch (error) {
        console.log('Auto-location detection failed (silent):', error);
        // Silently fail - don't show error to user for auto-detection
      } finally {
        setIsDetectingLocation(false);
      }
    };

    autoDetectLocation();
  }, []);

  const handleLocationSearch = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocation(query);
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search locations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const location = await getCurrentLocation();
      // Use the formatted address instead of coordinates
      const locationText = location.address || 'Current Location';
      setPickup(locationText);
      setLocationDetected(true);
      setSuggestions([]);
      setShowSuggestions(false);
      
      // Cache the location
      localStorage.setItem('userLocationSet', locationText);
      localStorage.setItem('userLocation', JSON.stringify(location));
      
      toast({
        title: "Location Detected",
        description: `Location set to: ${locationText}`,
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "Location Error",
        description: error instanceof Error ? error.message : "Failed to get current location",
        variant: "destructive"
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSuggestionClick = (suggestion: Location) => {
    // Use the formatted address instead of coordinates
    const locationText = suggestion.address || `${suggestion.city}, ${suggestion.state}`;
    setPickup(locationText);
    setLocationDetected(true);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Cache the selected location
    localStorage.setItem('userLocationSet', locationText);
    localStorage.setItem('userLocation', JSON.stringify(suggestion));
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get your car washed, <span className="text-blue-600">anywhere</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional car washing services at your doorstep. Book now and get your car sparkling clean.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={isDetectingLocation ? "Detecting location..." : "Enter pickup location"}
                    value={pickup}
                    onChange={(e) => {
                      setPickup(e.target.value);
                      handleLocationSearch(e.target.value);
                    }}
                    onFocus={() => pickup.length >= 3 && setShowSuggestions(true)}
                    className="pl-10 h-12 text-lg border-gray-200 focus:border-blue-500"
                    disabled={isDetectingLocation}
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  {locationDetected && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleCurrentLocation}
                  disabled={isDetectingLocation}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 border-gray-200 hover:border-blue-500"
                >
                  <Navigation2 className={`w-5 h-5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 truncate">
                          {suggestion.address}
                        </div>
                        {suggestion.city && (
                          <div className="text-sm text-gray-500">{suggestion.city}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              disabled={!pickup.trim() || isDetectingLocation}
            >
              {isDetectingLocation ? 'Detecting Location...' : 'Book Now'}
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Available in major cities • 
            <span className="text-blue-600 font-medium"> 30-60 min service</span> • 
            Professional equipment
          </p>
        </div>
      </div>
    </div>
  );
};

export default UberLikeHero;
