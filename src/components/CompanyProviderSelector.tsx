import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Clock, Phone, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProviderFilters from './ProviderFilters';
import { useProviderFilters } from '@/hooks/useProviderFilters';

interface Company {
  id: string;
  company_name: string;
  phone: string;
  city: string;
  base_price: number;
  rating?: number;
  distance?: number;
  available?: boolean;
  services?: string[];
}

interface CompanyProviderSelectorProps {
  serviceId: string;
  serviceTitle: string;
  onCompanySelect: (company: Company) => void;
  onBack: () => void;
}

const CompanyProviderSelector = ({ serviceId, serviceTitle, onCompanySelect, onBack }: CompanyProviderSelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const {
    filters,
    setFilters,
    filteredCompanies,
    activeFiltersCount,
    clearFilters
  } = useProviderFilters(companies);

  useEffect(() => {
    fetchCompanies();
  }, [serviceId]);

  const fetchCompanies = async () => {
    try {
      // Get approved companies with their service pricing
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          company_name,
          phone,
          city,
          services
        `)
        .eq('status', 'approved');

      if (companiesError) throw companiesError;

      // Get pricing for this specific service
      const { data: pricingData, error: pricingError } = await supabase
        .from('company_service_pricing')
        .select('company_id, base_price')
        .eq('service_id', serviceId)
        .eq('is_available', true);

      if (pricingError) throw pricingError;

      // Combine company data with pricing
      const companiesWithPricing = companiesData
        .map(company => {
          const pricing = pricingData.find(p => p.company_id === company.id);
          if (!pricing) return null;

          return {
            ...company,
            base_price: pricing.base_price,
            rating: 4.2 + Math.random() * 0.8, // Mock rating
            distance: Math.random() * 10, // Mock distance
            available: Math.random() > 0.2 // Mock availability
          };
        })
        .filter(Boolean) as Company[];

      setCompanies(companiesWithPricing);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service providers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{serviceTitle}</h1>
              <p className="text-sm text-gray-600">{filteredCompanies.length} providers</p>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <ProviderFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Mobile Company List */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="space-y-3">
          {filteredCompanies.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-500">
                  <p className="font-medium">No providers found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Company Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{company.company_name}</h3>
                          {company.available && (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span>{company.rating?.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{company.distance?.toFixed(1)} km</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>~30 min</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{company.phone}</span>
                        </div>
                      </div>

                      <div className="text-right ml-3">
                        <div className="text-xl font-bold text-gray-900">
                          ₹{(company.base_price / 100).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">base price</div>
                      </div>
                    </div>

                    {/* Services */}
                    {company.services && company.services.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {company.services.slice(0, 2).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {company.services.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{company.services.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      onClick={() => onCompanySelect(company)}
                      className="w-full bg-black hover:bg-gray-800 text-white h-10"
                    >
                      Select Provider
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProviderSelector;
