
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
    basic: number;
    premium: number;
    deluxe: number;
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
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'approved');

      if (error) throw error;

      // Transform the data to match our interface
      const transformedCompanies: Company[] = data?.map(company => ({
        id: company.id,
        name: company.company_name || 'Unknown Company',
        description: company.description || 'Professional car wash service',
        services: company.services || [selectedService],
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        reviews: Math.floor(Math.random() * 200) + 50, // Mock reviews
        distance: Math.round((Math.random() * 10 + 1) * 10) / 10, // Mock distance
        estimatedTime: `${Math.floor(Math.random() * 30) + 15} mins`,
        pricing: {
          basic: 299,
          premium: 499,
          deluxe: 699
        },
        status: company.status as 'approved',
        location: `${company.city || 'Mumbai'}, ${company.address || ''}`
      })) || [];

      // Filter companies that offer the selected service
      const filteredCompanies = transformedCompanies.filter(company => 
        company.services.includes(selectedService)
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
        return a.pricing.basic - b.pricing.basic;
      default:
        return 0;
    }
  });

  const handleProviderSelect = (provider: Company) => {
    setSelectedProvider(provider);
  };

  const handleBookNow = () => {
    if (selectedProvider) {
      onProviderSelect(selectedProvider);
    }
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
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-lg font-semibold">{selectedService}</h1>
            <button className="text-gray-600">
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
                onClick={() => setSortBy(option)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
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
            className={`cursor-pointer transition-all ${
              selectedProvider?.id === company.id 
                ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleProviderSelect(company)}
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
                <div className="flex space-x-2">
                  {Object.entries(company.pricing).map(([type, price]) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}: ₹{price}
                    </Badge>
                  ))}
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
              onClick={handleBookNow}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"
            >
              Book {selectedProvider.name} - ₹{selectedProvider.pricing.basic}+
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProviderSelector;
