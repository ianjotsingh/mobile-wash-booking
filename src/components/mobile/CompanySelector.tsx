
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Clock, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  company_name: string;
  address: string;
  city: string;
  phone: string;
  experience: string;
  has_mechanic: boolean;
  services: string[];
  latitude: number;
  longitude: number;
  distance?: number;
}

interface CompanySelectorProps {
  serviceType: string;
  userLocation: { lat: number; lng: number };
  onCompanySelect: (company: Company) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  serviceType,
  userLocation,
  onCompanySelect
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNearbyCompanies();
  }, [serviceType, userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyCompanies = async () => {
    try {
      console.log('Fetching companies for service:', serviceType);
      console.log('User location:', userLocation);

      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .eq('status', 'approved')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      console.log('All companies fetched:', companiesData);

      // Filter companies within 20km and that offer the service
      const nearbyCompanies = companiesData
        ?.filter((company) => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            Number(company.latitude),
            Number(company.longitude)
          );
          
          const hasService = company.services?.includes(serviceType) || 
                           company.services?.some(service => 
                             service.toLowerCase().includes(serviceType.toLowerCase())
                           );
          
          console.log(`Company ${company.company_name}:`, {
            distance: distance.toFixed(2) + 'km',
            hasService,
            services: company.services
          });

          return distance <= 20 && hasService;
        })
        .map((company) => ({
          ...company,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            Number(company.latitude),
            Number(company.longitude)
          )
        }))
        .sort((a, b) => a.distance! - b.distance!) || [];

      console.log('Nearby companies within 20km:', nearbyCompanies);
      setCompanies(nearbyCompanies);

      if (nearbyCompanies.length === 0) {
        toast({
          title: "No companies found",
          description: `No companies offering ${serviceType} found within 20km of your location.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load nearby companies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Finding companies near you...</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Companies Found
          </h3>
          <p className="text-gray-600">
            No companies offering {serviceType} are available within 20km of your location.
          </p>
          <Button 
            onClick={fetchNearbyCompanies} 
            variant="outline" 
            className="mt-4"
          >
            Refresh Search
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Available Companies ({companies.length})
      </h3>
      {companies.map((company) => (
        <Card key={company.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{company.company_name}</CardTitle>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{company.city} • {company.distance?.toFixed(1)}km away</span>
                </div>
              </div>
              <Badge variant="secondary">
                {company.experience} experience
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{company.phone}</span>
              </div>
              
              {company.has_mechanic && (
                <Badge variant="outline" className="mr-2">
                  <span className="mr-1">🔧</span>
                  Mechanic Services Available
                </Badge>
              )}

              <div className="flex flex-wrap gap-2">
                {company.services?.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>

              <Button 
                onClick={() => onCompanySelect(company)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Select This Company
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompanySelector;
