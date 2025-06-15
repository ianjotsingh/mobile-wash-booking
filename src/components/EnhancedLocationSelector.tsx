import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Crosshair, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string; city: string; zipCode: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string; city: string; zipCode: string };
  buttonLabel?: string; // new: optional
  showCurrentLocationButton?: boolean; // new: optional
}

const EnhancedLocationSelector = ({
  onLocationSelect,
  initialLocation,
  buttonLabel = "Use Current Location",     // default value for backward compatibility
  showCurrentLocationButton = true,         // default value for backward compatibility
}: LocationSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address: string; city: string; zipCode: string } | null>(initialLocation || null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use a reverse geocoding service to get address details
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
          );
          
          if (!response.ok) {
            // Fallback to basic location
            const location = {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              city: 'Unknown City',
              zipCode: '000000'
            };
            setCurrentLocation(location);
            onLocationSelect(location);
            toast({
              title: "Location Found",
              description: "Using current coordinates (limited address info)"
            });
          }
        } catch (error) {
          // Fallback for demo purposes
          const location = {
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            city: 'Current Location',
            zipCode: '000000'
          };
          setCurrentLocation(location);
          onLocationSelect(location);
          toast({
            title: "Location Found",
            description: "Using current GPS coordinates"
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please enter manually.",
          variant: "destructive"
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // For demo purposes, create mock search results for Indian cities
      const mockResults = [
        {
          display_name: `${searchQuery}, Mumbai, Maharashtra, India`,
          lat: 19.0760 + (Math.random() - 0.5) * 0.1,
          lon: 72.8777 + (Math.random() - 0.5) * 0.1,
          city: searchQuery,
          state: 'Maharashtra',
          postcode: '400001'
        },
        {
          display_name: `${searchQuery}, Delhi, India`,
          lat: 28.7041 + (Math.random() - 0.5) * 0.1,
          lon: 77.1025 + (Math.random() - 0.5) * 0.1,
          city: searchQuery,
          state: 'Delhi',
          postcode: '110001'
        },
        {
          display_name: `${searchQuery}, Bangalore, Karnataka, India`,
          lat: 12.9716 + (Math.random() - 0.5) * 0.1,
          lon: 77.5946 + (Math.random() - 0.5) * 0.1,
          city: searchQuery,
          state: 'Karnataka',
          postcode: '560001'
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Unable to search locations. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const selectSearchResult = (result: any) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
      city: result.city || 'Unknown',
      zipCode: result.postcode || '000000'
    };
    setCurrentLocation(location);
    onLocationSelect(location);
    setSearchResults([]);
    setSearchQuery('');
    toast({
      title: "Location Selected",
      description: `Selected: ${location.city}`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for city or area in India..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          />
          <Button onClick={searchLocation} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {showCurrentLocationButton && (
          <Button 
            onClick={getCurrentLocation} 
            disabled={loading}
            variant="outline" 
            className="w-full"
          >
            <Crosshair className="h-4 w-4 mr-2" />
            {loading ? 'Getting Location...' : buttonLabel}
          </Button>
        )}

        {searchResults.length > 0 && (
          <div className="border rounded-lg max-h-40 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => selectSearchResult(result)}
              >
                <div className="font-medium">{result.city}</div>
                <div className="text-sm text-gray-600">{result.display_name}</div>
              </div>
            ))}
          </div>
        )}

        {currentLocation && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Selected Location</span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              {currentLocation.address}
            </div>
            <div className="text-xs text-green-500 mt-1">
              Coordinates: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedLocationSelector;
