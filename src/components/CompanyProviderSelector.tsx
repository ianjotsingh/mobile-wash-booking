
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
  distance: number;
  estimatedTime: string;
  pricing: {
    [key: string]: number;
  };
  status: 'approved' | 'pending' | 'rejected';
  location: string;
}

interface CompanyProviderSelectorProps {
  selectedService: string;
  userLocation: string;
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

  useEffect(() => {
    fetchCompanies();
  }, [selectedService]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Fetch companies with their pricing
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
        .eq('status', 'approved');

      if (companiesError) throw companiesError;

      // Transform the data to match our interface
      const transformedCompanies: Company[] = companiesData?.map(company => {
        // Create pricing object from company_service_pricing
        const pricing: { [key: string]: number } = {};
        company.company_service_pricing?.forEach((service: any) => {
          if (service.is_available) {
            pricing[service.service_id] = service.base_price;
          }
        });

        return {
          id: company.id,
          name: company.company_name || 'Unknown Company',
          description: company.description || 'Professional service provider',
          services: company.services || [selectedService],
          rating: 4.2 + Math.random() * 0.8, // Mock rating between 4.2-5.0
          reviews: Math.floor(Math.random() * 150) + 25, // Mock reviews 25-175
          distance: Math.round((Math.random() * 8 + 0.5) * 10) / 10, // Mock distance 0.5-8.5km
          estimatedTime: `${Math.floor(Math.random() * 25) + 10} mins`, // 10-35 mins
          pricing,
          status: company.status as 'approved',
          location: `${company.city || 'Mumbai'}, ${company.address || ''}`
        };
      }) || [];

      // Filter companies that have pricing for the selected service
      const filteredCompanies = transformedCompanies.filter(company => 
        company.pricing[selectedService] !== undefined
      );

      setCompanies(filteredCompanies);
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

  const handleBookNow = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (selectedProvider) {
      onProviderSelect(selectedProvider);
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
            <span>{userLocation}</span>
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
