
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, User } from 'lucide-react';

interface ServiceProvider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  estimatedArrival: string;
  specializations?: string[];
  avatar?: string;
}

interface ServiceProviderSelectorProps {
  providers: ServiceProvider[];
  selectedProvider: ServiceProvider | null;
  onProviderSelect: (provider: ServiceProvider) => void;
}

const ServiceProviderSelector = ({ providers, selectedProvider, onProviderSelect }: ServiceProviderSelectorProps) => {
  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <Card
          key={provider.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedProvider?.id === provider.id
              ? 'ring-2 ring-emerald-400 bg-emerald-900/20 border-emerald-500'
              : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
          }`}
          onClick={() => onProviderSelect(provider)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  {provider.avatar ? (
                    <img 
                      src={provider.avatar} 
                      alt={provider.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{provider.name}</h4>
                  
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300">
                        {provider.rating} ({provider.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{provider.distance} km away</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Arrives in {provider.estimatedArrival}</span>
                  </div>
                  
                  {provider.specializations && provider.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {provider.specializations.slice(0, 3).map((spec, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-700 text-gray-300"
                        >
                          {spec}
                        </Badge>
                      ))}
                      {provider.specializations.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          +{provider.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedProvider?.id === provider.id && (
                <div className="ml-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="bg-gray-800 border-gray-700 border-dashed cursor-pointer hover:bg-gray-750 transition-colors">
        <CardContent className="p-4">
          <div className="text-center text-gray-400">
            <User className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">No preference</p>
            <p className="text-sm">Let us assign the best available provider</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceProviderSelector;
