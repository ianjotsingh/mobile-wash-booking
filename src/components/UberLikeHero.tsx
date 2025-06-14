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

  // Add service objects (matching ServiceSelector shape)
  const services = [
    { id: 'Basic', name: 'Basic', title: 'Basic Wash', description: 'Essential exterior wash', price: '₹299', icon: '🚗', category: 'wash' },
    { id: 'Premium', name: 'Premium', title: 'Premium Wash', description: 'Full exterior + interior clean', price: '₹499', icon: '✨', category: 'wash', popular: true },
    { id: 'Deluxe', name: 'Deluxe', title: 'Full Detailing', description: 'Complete inside-out clean & polish', price: '₹599', icon: '💎', category: 'wash' }
  ];

  // Find full service object by selectedService, fallback to Premium
  const getSelectedServiceObject = () => {
    const found = services.find((s) => s.id === selectedService || s.name === selectedService);
    // Default to Premium service if not found
    return found || services[1];
  };

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
    
    // Use the new full object format for storing selectedService
    const serviceObj = getSelectedServiceObject();
    // Match ServiceSelector's localStorage format
    const localStorageService = {
      id: serviceObj.id,
      title: serviceObj.title,
      description: serviceObj.description,
      price: serviceObj.price,
      features: [
        serviceObj.id === 'Basic'
          ? 'Exterior wash, Tire cleaning, Basic drying'
          : serviceObj.id === 'Premium'
          ? 'Exterior wash, Interior vacuuming, Dashboard cleaning, Tire shine'
          : 'Complete wash, Wax application, Deep interior cleaning, Polish'
      ],
      duration: serviceObj.id === 'Basic' ? '30 mins' : serviceObj.id === 'Premium' ? '60 mins' : '90 mins',
      category: 'wash',
      popular: serviceObj.popular || false
    };
    localStorage.setItem('selectedService', JSON.stringify(localStorageService));
    
    if (selectedLocation) {
      localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
    }
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
    
    // You can consider similar uniformity for mechanic service if mechanic booking uses selectedService
    // For now, just store location
    if (selectedLocation) {
      localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
    }
    
    navigate('/mechanic-request');
  };

  return (
    <>
      <div className="relative min-h-screen bg-white flex items-center justify-center">
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <div className="text-center mb-12 fade-in">
            <h1 className="text-4xl font-bold text-black mb-4 leading-tight">
              Car services at your
              <br />
              <span className="text-black">fingertips</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Professional car wash and mechanic services delivered to your location
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 slide-in">
            <div className="space-y-6">
              {/* Location Input */}
              <div className="relative">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-black transition-colors">
                  <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <Input
                    placeholder="Enter pickup location"
                    value={pickupLocation}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    className="border-none bg-transparent text-black placeholder-gray-500 focus-visible:ring-0 flex-1 text-base"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={detectCurrentLocation}
                    disabled={loading}
                    className="text-gray-600 hover:text-black hover:bg-gray-100 flex-shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {showResults && searchResults.length > 0 && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                    {searchResults.map((location, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => selectLocation(location)}
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
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
              </div>

              {/* Service Selection */}
              <div className="grid grid-cols-3 gap-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-3 border rounded-lg text-center cursor-pointer transition-all duration-200 ${
                      selectedService === service.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="text-2xl mb-1">{service.icon}</div>
                    <div className={`text-sm font-medium ${
                      selectedService === service.id ? 'text-black' : 'text-gray-700'
                    }`}>
                      {service.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {service.price}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleBookNow}
                  className="w-full bg-black hover:bg-gray-800 text-white h-12 text-base font-medium rounded-lg transition-all duration-200"
                  disabled={!pickupLocation.trim()}
                >
                  Book Car Wash
                </Button>
                
                <Button
                  onClick={handleCallMechanic}
                  className="w-full bg-white hover:bg-gray-50 text-black border border-gray-200 h-12 text-base font-medium rounded-lg transition-all duration-200"
                  disabled={!pickupLocation.trim()}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Get Mechanic
                </Button>
              </div>

              {/* Simple Stats */}
              <div className="flex justify-center space-x-8 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">30 min</span>
                  </div>
                  <div className="text-xs text-gray-500">Response time</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">4.8★</div>
                  <div className="text-xs text-gray-500">Rating</div>
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
