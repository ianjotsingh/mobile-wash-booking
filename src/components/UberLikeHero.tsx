
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
      <div className="relative min-h-screen bg-primary-gradient flex items-center justify-center overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTI1MjUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <div className="text-center mb-12 fade-in">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Car Wash & 
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">
                Mechanic Services
              </span>
              <br />
              <span className="text-2xl font-normal text-blue-100">on Demand</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Premium automotive services at your doorstep with trusted professionals
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl backdrop-blur-sm slide-in-up">
            <div className="space-y-6">
              {/* Location Input */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-blue-300 transition-colors">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <Input
                    placeholder="Search for your location in India..."
                    value={pickupLocation}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    className="border-none bg-transparent text-black placeholder-gray-500 focus-visible:ring-0 flex-1 text-base"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={detectCurrentLocation}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0 rounded-xl"
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
                  <div className="absolute top-full left-0 right-0 bg-white border-2 border-blue-100 rounded-2xl shadow-xl z-50 p-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Searching locations...</span>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {showResults && searchResults.length > 0 && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 bg-white border-2 border-blue-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto mt-2">
                    {searchResults.map((location, index) => (
                      <div
                        key={index}
                        className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors rounded-2xl"
                        onClick={() => selectLocation(location)}
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
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
                  <div className="absolute top-full left-0 right-0 bg-white border-2 border-red-100 rounded-2xl shadow-xl z-50 p-4 mt-2">
                    <div className="text-sm text-gray-500 text-center">
                      No locations found. Try a different search term.
                    </div>
                  </div>
                )}
              </div>

              {/* Service Selection */}
              <div className="grid grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border-2 rounded-2xl text-center cursor-pointer transition-all duration-300 ${
                      selectedService === service.id
                        ? 'border-blue-400 bg-blue-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="text-3xl mb-2">{service.icon}</div>
                    <div className={`text-sm font-semibold ${
                      selectedService === service.id ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {service.name}
                    </div>
                    <div className={`text-xs font-medium ${
                      selectedService === service.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {service.price}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleBookNow}
                  className="w-full bg-wash-gradient hover:shadow-xl hover:shadow-blue-500/25 text-white h-14 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
                  disabled={!pickupLocation.trim()}
                >
                  Book Car Wash
                </Button>
                
                <Button
                  onClick={handleCallMechanic}
                  className="w-full bg-mechanic-gradient hover:shadow-xl hover:shadow-orange-500/25 text-white h-12 text-base font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                  disabled={!pickupLocation.trim()}
                >
                  <Wrench className="h-5 w-5 mr-2" />
                  Call Mechanic
                </Button>
              </div>

              {/* Stats */}
              <div className="flex justify-center space-x-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-gray-900">30 min</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Average Response</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-emerald-600">4.8★</div>
                  <div className="text-xs text-gray-500 font-medium">Rating</div>
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
