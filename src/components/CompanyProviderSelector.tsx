import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, IndianRupee, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  description: string;
  services: string[];
  rating: number;
  reviews: number;
  distance: number; // already used for sorting, but we'll calculate it precisely now
  estimatedTime: string;
  pricing: {
    [key: string]: number;
  };
  status: 'approved' | 'pending' | 'rejected';
  location: string;
  latitude?: number;
  longitude?: number;
}

interface CompanyProviderSelectorProps {
  selectedService: string;
  userLocation: { lat: number; lng: number }; // <-- Require lat/lng for precise filtering
  onProviderSelect: (provider: Company) => void;
  onBack: () => void;
}

const CompanyProviderSelector = ({ 
  selectedService, 
  userLocation, 
  onProviderSelect, 
  onBack 
}: CompanyProviderSelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Company | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const { toast } = useToast();

  // Use Haversine formula for distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, [selectedService, userLocation]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Fetch approved companies with coordinates and their pricing/services
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          company_service_pricing(
            service_id,
            service_name,
            base_price,
            is_available
          )
        `)
        .eq('status', 'approved')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (companiesError) throw companiesError;

      // Filter and enrich with distance
      const filtered: Company[] = [];
      companiesData?.forEach(company => {
        if(!company.latitude || !company.longitude) return;

        // Only include if this company provides this service and has a price for it
        const pricing: { [key: string]: number } = {};
        let hasService = false;
        company.company_service_pricing?.forEach((service: any) => {
          if (service.is_available && (service.service_id === selectedService || service.service_name?.toLowerCase().includes(selectedService.toLowerCase()))) {
            hasService = true;
            pricing[service.service_id] = service.base_price;
          }
        });

        if (!hasService) return;

        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          Number(company.latitude),
          Number(company.longitude)
        );

        if (distance <= 20) {
          filtered.push({
            id: company.id,
            name: company.company_name || 'Unknown Company',
            description: company.description || 'Professional service provider',
            services: company.services || [selectedService],
            rating: 4.2 + Math.random() * 0.8, // Mock rating between 4.2-5.0
            reviews: Math.floor(Math.random() * 150) + 25, // Mock reviews 25-175
            distance,
            estimatedTime: `${Math.floor(Math.random() * 25) + 10} mins`, // 10-35 mins (fake)
            pricing,
            status: company.status as 'approved',
            location: `${company.city || 'Mumbai'}, ${company.address || ''}`,
            latitude: Number(company.latitude),
            longitude: Number(company.longitude),
          });
        }
      });

      setCompanies(filtered);
      if (filtered.length === 0) {
        toast({
          title: "No companies found",
          description: `No companies offering ${selectedService} found within 20km of your location.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        const priceA = a.pricing[selectedService] || 0;
        const priceB = b.pricing[selectedService] || 0;
        return priceA - priceB;
      default:
        return 0;
    }
  });

  const handleProviderSelect = (provider: Company, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedProvider(provider);
  };

  const handleBookNow = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!selectedProvider) return;
    try {
      // Create order for this user and selectedProvider
      // (You may need to gather booking date, car model, etc. This is a simplified version.)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to book a service.",
          variant: "destructive"
        });
        return;
      }

      // Sample required fields - adjust as needed!
      const orderPayload = {
        user_id: user.id,
        service_type: selectedService,
        booking_date: new Date().toISOString().slice(0,10),
        booking_time: "09:00", // Placeholder - adjust as needed
        address: "Provided location", // Capture from customer
        city: "N/A", // Should use customer's entry
        zip_code: "",
        car_type: "",
        car_color: "",
        car_model: "",
        special_instructions: "",
        total_amount: selectedProvider.pricing[selectedService] || 0,
        selected_company_id: selectedProvider.id,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        status: "pending"
      };

      const { error, data } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select();

      if (error) throw error;

      toast({
        title: "Booking Requested!",
        description: `${selectedProvider.name} will review your booking.`,
        variant: "success",
      });

      // Pass selectedProvider back if needed, or redirect
      onProviderSelect(selectedProvider);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Could not create your booking request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onBack();
  };

  const formatPrice = (priceInPaise: number): string => {
    return `₹${Math.floor(priceInPaise / 100)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={handleBackClick}
              className="text-gray-600 hover:text-gray-900 touch-manipulation"
            >
              ← Back
            </button>
            <h1 className="text-lg font-semibold">{selectedService}</h1>
            <button type="button" className="text-gray-600 touch-manipulation">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          
          {/* Location */}
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{userLocation.lat}, {userLocation.lng}</span>
          </div>
          
          {/* Sort Options */}
          <div className="flex space-x-2 mt-3">
            {(['distance', 'rating', 'price'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSortBy(option)}
                className={`px-3 py-1 rounded-full text-xs font-medium touch-manipulation ${
                  sortBy === option
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {option === 'distance' ? 'Nearest' : 
                 option === 'rating' ? 'Top Rated' : 'Price'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Providers List */}
      <div className="max-w-md mx-auto p-4 space-y-3">
        {sortedCompanies.map((company) => (
          <Card 
            key={company.id}
            className={`cursor-pointer transition-all touch-manipulation ${
              selectedProvider?.id === company.id 
                ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                : 'hover:shadow-md'
            }`}
            onClick={(e) => handleProviderSelect(company, e)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{company.description}</p>
                </div>
                <div className="text-right ml-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{company.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500">({company.reviews} reviews)</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{company.distance} km away</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{company.estimatedTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-emerald-600">
                  {company.pricing[selectedService] ? formatPrice(company.pricing[selectedService]) : 'Contact for pricing'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Action */}
      {selectedProvider && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-md mx-auto">
            <Button 
              type="button"
              onClick={handleBookNow}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 touch-manipulation"
            >
              Book {selectedProvider.name} - {selectedProvider.pricing[selectedService] ? formatPrice(selectedProvider.pricing[selectedService]) : 'Get Quote'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProviderSelector;
