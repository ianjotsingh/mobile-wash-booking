
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentLocation, searchLocation, Location } from '@/utils/locationService';
import { useToast } from '@/hooks/use-toast';

const UberLikeHero = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Auto-detect location on load
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setPickupLocation(location.address || `${location.city}, ${location.state}`);
      toast({
        title: "Location detected",
        description: "We found your current location",
      });
    } catch (error) {
      console.log('Could not detect location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (query: string) => {
    setPickupLocation(query);
    if (query.length > 2) {
      try {
        const results = await searchLocation(query);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setShowResults(false);
    }
  };

  const selectLocation = (location: Location) => {
    setPickupLocation(location.address || '');
    setShowResults(false);
  };

  const handleBookNow = () => {
    navigate('/booking');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTI1MjUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl font-bold text-white mb-4">
            Car Wash on
            <br />
            <span className="text-emerald-400">Demand</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Premium car wash services at your doorstep
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl slide-in-up">
          <div className="space-y-6">
            {/* Location Input */}
            <div className="relative">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <MapPin className="h-5 w-5 text-gray-600" />
                <Input
                  placeholder="Enter pickup location"
                  value={pickupLocation}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  className="border-none bg-transparent text-black placeholder-gray-500 focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={detectCurrentLocation}
                  disabled={loading}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto mt-2">
                  {searchResults.map((location, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => selectLocation(location)}
                    >
                      <div className="font-medium text-gray-900 text-sm">{location.address}</div>
                      <div className="text-xs text-gray-500">
                        {location.city}, {location.state}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Selection */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 border rounded-xl text-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="text-2xl mb-2">🚗</div>
                <div className="text-sm font-medium text-gray-900">Basic</div>
                <div className="text-xs text-gray-500">₹299</div>
              </div>
              <div className="p-4 border-2 border-emerald-400 bg-emerald-50 rounded-xl text-center cursor-pointer">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-sm font-medium text-emerald-700">Premium</div>
                <div className="text-xs text-emerald-600">₹599</div>
              </div>
              <div className="p-4 border rounded-xl text-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="text-2xl mb-2">💎</div>
                <div className="text-sm font-medium text-gray-900">Deluxe</div>
                <div className="text-xs text-gray-500">₹999</div>
              </div>
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBookNow}
              className="w-full bg-black text-white hover:bg-gray-800 h-14 text-lg font-semibold rounded-xl"
              disabled={!pickupLocation}
            >
              Book Car Wash
            </Button>

            {/* Stats */}
            <div className="flex justify-center space-x-8 pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">30 min</span>
                </div>
                <div className="text-xs text-gray-500">Average time</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900">4.9</span>
                </div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UberLikeHero;
