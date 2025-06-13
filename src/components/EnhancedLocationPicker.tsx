
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Search, Navigation } from 'lucide-react';
import { getCurrentLocation, searchLocation, Location } from '@/utils/locationService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialAddress?: string;
  initialCity?: string;
  initialZipCode?: string;
  showMap?: boolean;
}

const EnhancedLocationPicker = ({ 
  onLocationSelect, 
  initialAddress = '', 
  initialCity = '', 
  initialZipCode = '',
  showMap = true
}: EnhancedLocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [zipCode, setZipCode] = useState(initialZipCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (showMap && mapRef.current && !mapLoaded) {
      initializeMap();
    }
  }, [showMap, mapLoaded]);

  const initializeMap = () => {
    // In a real implementation, you would use Google Maps API
    // For now, we'll show a placeholder
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div class="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
          <div class="text-center text-gray-400">
            <MapPin class="w-12 h-12 mx-auto mb-2" />
            <p class="font-medium">Interactive Map</p>
            <p class="text-sm">Google Maps integration would go here</p>
          </div>
        </div>
      `;
      setMapLoaded(true);
    }
  };

  const handleCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setAddress(location.address || '');
      setCity(location.city || '');
      setZipCode(location.zipCode || '');
      
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        zipCode: location.zipCode || ''
      });
      
      toast({
        title: "Location Found",
        description: "Your current location has been detected successfully."
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your current location. Please search for your location below.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await searchLocation(query);
      setSearchResults(results);
      setShowResults(true);
      
      if (results.length === 0) {
        toast({
          title: "No locations found",
          description: "Try searching with a different term or check your spelling.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Could not search for locations. Please check your connection and try again.",
        variant: "destructive"
      });
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setAddress(location.address || '');
    setCity(location.city || '');
    setZipCode(location.zipCode || '');
    setSearchResults([]);
    setSearchQuery('');
    setShowResults(false);
    onLocationSelect(location);
    
    toast({
      title: "Location Selected",
      description: location.address || `${location.city}, ${location.state}`,
    });
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    // Debounced search
    const delayedSearch = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(delayedSearch);
  };

  useEffect(() => {
    const cleanup = handleSearchInputChange(searchQuery);
    return cleanup;
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Map Display */}
      {showMap && (
        <div className="mb-6">
          <Label className="text-white mb-3 block">Select Location on Map</Label>
          <div ref={mapRef} className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Interactive Map</p>
              <p className="text-sm">Click to select your location</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Current Location */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Search for a location in India (e.g., Mumbai, Bangalore, Delhi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-gray-800 border-gray-600 text-white"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            
            {searchLoading && (
              <div className="absolute right-10 top-3">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleCurrentLocation}
            disabled={loading}
            className="flex items-center gap-2 whitespace-nowrap border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            Current Location
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 z-50 border rounded-md bg-gray-800 border-gray-600 shadow-lg max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((location, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0 transition-colors"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-100 truncate">
                          {location.address}
                        </div>
                        <div className="text-xs text-gray-400">
                          {location.city}, {location.state} {location.zipCode}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-400 text-center">
                  No locations found. Try a different search term.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual Address Entry */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address" className="text-white">Complete Service Address</Label>
          <Input
            id="address"
            placeholder="Enter your complete address"
            className="mt-2 bg-gray-800 border-gray-600 text-white"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="text-white">City</Label>
            <Input
              id="city"
              placeholder="City"
              className="mt-2 bg-gray-800 border-gray-600 text-white"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="zipcode" className="text-white">ZIP Code</Label>
            <Input
              id="zipcode"
              placeholder="ZIP Code"
              className="mt-2 bg-gray-800 border-gray-600 text-white"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLocationPicker;
