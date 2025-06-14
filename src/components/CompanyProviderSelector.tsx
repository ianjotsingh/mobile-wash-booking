
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/pricingCalculator';

interface Company {
  id: string;
  company_name: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  estimatedArrival: string;
  base_price: number;
  is_available: boolean;
  city: string;
  address: string;
}

interface CompanyProviderSelectorProps {
  serviceId: string;
  serviceTitle: string;
  onCompanySelect: (company: Company) => void;
  onBack: () => void;
}

const CompanyProviderSelector = ({ 
  serviceId, 
  serviceTitle, 
  onCompanySelect, 
  onBack 
}: CompanyProviderSelectorProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompaniesForService();
  }, [serviceId]);

  const fetchCompaniesForService = async () => {
    try {
      console.log('Fetching companies for service:', serviceId);
      
      const { data, error } = await supabase
        .from('company_service_pricing')
        .select(`
          *,
          companies!inner (
            id,
            company_name,
            city,
            address,
            status
          )
        `)
        .eq('service_id', serviceId)
        .eq('is_available', true)
        .eq('companies.status', 'approved');

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      console.log('Fetched company pricing data:', data);

      const companiesWithPricing = data?.map(item => ({
        id: item.companies.id,
        company_name: item.companies.company_name,
        city: item.companies.city,
        address: item.companies.address,
        base_price: item.base_price,
        is_available: item.is_available,
        rating: 4.2 + Math.random() * 0.8, // Mock rating for demo
        reviewCount: Math.floor(50 + Math.random() * 200),
        distance: Math.round((Math.random() * 15 + 1) * 10) / 10,
        estimatedArrival: `${Math.floor(Math.random() * 30 + 15)} mins`
      })) || [];

      // Sort by price (lowest first)
      companiesWithPricing.sort((a, b) => a.base_price - b.base_price);
      
      setCompanies(companiesWithPricing);
    } catch (error) {
      console.error('Error in fetchCompaniesForService:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleContinueBooking = () => {
    if (selectedCompany) {
      onCompanySelect(selectedCompany);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding providers in your area...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mr-4 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{serviceTitle}</h1>
          <p className="text-gray-600">Choose from {companies.length} available providers</p>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers available</h3>
          <p className="text-gray-600">No service providers are currently available for this service in your area.</p>
        </div>
      ) : (
        <>
          {/* Companies List */}
          <div className="space-y-4 mb-6">
            {companies.map((company) => (
              <Card
                key={company.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedCompany?.id === company.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCompanySelect(company)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{company.company_name}</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatPrice(company.base_price)}
                            </div>
                            <div className="text-sm text-gray-500">+ taxes</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {company.rating?.toFixed(1)} ({company.reviewCount} reviews)
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{company.distance} km away</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Arrives in {company.estimatedArrival}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {company.city} • {company.address}
                        </div>
                      </div>
                    </div>
                    
                    {selectedCompany?.id === company.id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          {selectedCompany && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selected: {selectedCompany.company_name}</p>
                  <p className="font-semibold text-lg">{formatPrice(selectedCompany.base_price)}</p>
                </div>
                <Button 
                  onClick={handleContinueBooking}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Continue Booking
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompanyProviderSelector;
