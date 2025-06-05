import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Clock, Wrench, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentLocation, searchLocation, Location } from '@/utils/locationService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

const UberLikeHero = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedService, setSelectedService] = useState('Premium');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-detect location on load
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const displayAddress = location.address || `${location.city}, ${location.state}`;
      setPickupLocation(displayAddress);
      setSelectedLocation(location);
      toast({
        title: "Location detected",
        description: "We found your current location",
      });
    } catch (error) {
      console.log('Could not detect location:', error);
      toast({
        title: "Location access needed",
        description: "Please search for your location or allow location access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (query: string) => {
    setPickupLocation(query);
    
    if (query.length > 2) {
      setSearchLoading(true);
      try {
        const results = await searchLocation(query);
        setSearchResults(results);
        setShowResults(true);
        
        if (results.length === 0) {
          toast({
            title: "No locations found",
            description: "Try searching with a different term",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "Please check your internet connection and try again",
          variant: "destructive"
        });
      } finally {
        setSearchLoading(false);
      }
    } else {
      setShowResults(false);
      setSelectedLocation(null);
    }
  };

  const selectLocation = (location: Location) => {
    setPickupLocation(location.address || '');
    setSelectedLocation(location);
    setShowResults(false);
    toast({
      title: "Location selected",
      description: location.address || `${location.city}, ${location.state}`,
    });
  };

  const services = [
    { id: 'Basic', name: 'Basic', price: '₹299', icon: '🚗' },
    { id: 'Premium', name: 'Premium', price: '₹499', icon: '✨' },
    { id: 'Deluxe', name: 'Deluxe', price: '₹599', icon: '💎' }
  ];

  const handleBookNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!selectedLocation && !pickupLocation) {
      toast({
        title: "Location required",
        description: "Please select a pickup location to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Store selected location and service for booking flow
    if (selectedLocation) {
      localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
    }
    localStorage.setItem('selectedService', selectedService);
    
    navigate('/booking');
  };

  const handleCallMechanic = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!selectedLocation && !pickupLocation) {
      toast({
        title: "Location required",
        description: "Please select a location to call a mechanic",
        variant: "destructive"
      });
      return;
    }
    
    // Store selected location for mechanic request
    if (selectedLocation) {
      localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
    }
    
    navigate('/mechanic-request');
  };

  return (
    <>
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
                  <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <Input
                    placeholder="Search for your location in India..."
                    value={pickupLocation}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    className="border-none bg-transparent text-black placeholder-gray-500 focus-visible:ring-0 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={detectCurrentLocation}
                    disabled={loading}
                    className="text-emerald-600 hover:text-emerald-700 flex-shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Search Loading */}
                {searchLoading && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-50 p-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      <span className="text-sm text-gray-600">Searching locations...</span>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {showResults && searchResults.length > 0 && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto mt-2">
                    {searchResults.map((location, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => selectLocation(location)}
                      >
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {location.address}
                            </div>
                            <div className="text-xs text-gray-500">
                              {location.city}, {location.state} {location.zipCode}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {showResults && searchResults.length === 0 && !searchLoading && pickupLocation.length > 2 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-50 p-3 mt-2">
                    <div className="text-sm text-gray-500 text-center">
                      No locations found. Try a different search term.
                    </div>
                  </div>
                )}
              </div>

              {/* Service Selection */}
              <div className="grid grid-cols-3 gap-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-xl text-center cursor-pointer transition-colors ${
                      selectedService === service.id
                        ? 'border-2 border-emerald-400 bg-emerald-50'
                        : 'border hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="text-2xl mb-2">{service.icon}</div>
                    <div className={`text-sm font-medium ${
                      selectedService === service.id ? 'text-emerald-700' : 'text-gray-900'
                    }`}>
                      {service.name}
                    </div>
                    <div className={`text-xs ${
                      selectedService === service.id ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      {service.price}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleBookNow}
                  className="w-full bg-black text-white hover:bg-gray-800 h-14 text-lg font-semibold rounded-xl"
                  disabled={!pickupLocation.trim()}
                >
                  Book Car Wash
                </Button>
                
                <Button
                  onClick={handleCallMechanic}
                  variant="outline"
                  className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 h-12 text-base font-semibold rounded-xl"
                  disabled={!pickupLocation.trim()}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Call Mechanic
                </Button>
              </div>

              {/* Stats */}
              <div className="flex justify-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">30 min</span>
                  </div>
                  <div className="text-xs text-gray-500">Average time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal}>
        <div />
      </AuthModal>
    </>
  );
};

export default UberLikeHero;
