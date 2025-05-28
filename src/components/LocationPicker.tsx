
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Search } from 'lucide-react';
import { getCurrentLocation, searchLocation, Location } from '@/utils/locationService';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialAddress?: string;
  initialCity?: string;
  initialZipCode?: string;
}

const LocationPicker = ({ onLocationSelect, initialAddress = '', initialCity = '', initialZipCode = '' }: LocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [zipCode, setZipCode] = useState(initialZipCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const { toast } = useToast();

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
        zipCode: location.zipCode || ''
      });
      
      toast({
        title: "Location Found",
        description: "Your current location has been detected successfully."
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your current location. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Could not search for locations. Please try again.",
        variant: "destructive"
      });
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
    onLocationSelect(location);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Search for a location in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          Use Current Location
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="border rounded-md p-2 bg-white shadow-sm max-h-48 overflow-y-auto">
          {searchResults.map((location, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-50 cursor-pointer rounded"
              onClick={() => handleLocationSelect(location)}
            >
              <div className="font-medium text-sm">{location.address}</div>
              <div className="text-xs text-gray-500">
                {location.city}, {location.state} {location.zipCode}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="address">Service Address</Label>
        <Input
          id="address"
          placeholder="Enter your complete address"
          className="mt-2"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="City"
            className="mt-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="zipcode">ZIP Code</Label>
          <Input
            id="zipcode"
            placeholder="ZIP Code"
            className="mt-2"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
