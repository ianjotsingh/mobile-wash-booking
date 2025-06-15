
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Car, Wrench, Clock, Star, Plus, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: 'wash' | 'mechanic';
  description: string;
  duration: string;
  basePrice: number;
  features: string[];
  popular?: boolean;
}

interface ServiceOnboardingProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  onPricingChange: (pricing: any[]) => void;
}

const ServiceOnboarding: React.FC<ServiceOnboardingProps> = ({
  selectedServices,
  onServicesChange,
  onPricingChange
}) => {
  const [customService, setCustomService] = useState({
    name: '',
    description: '',
    duration: '',
    price: 0,
    category: 'wash' as 'wash' | 'mechanic'
  });

  const predefinedServices: Service[] = [
    {
      id: 'basic-wash',
      name: 'Basic Wash',
      category: 'wash',
      description: 'Essential exterior cleaning',
      duration: '30 mins',
      basePrice: 299,
      features: ['Exterior wash', 'Tire cleaning', 'Basic drying']
    },
    {
      id: 'premium-wash',
      name: 'Premium Wash',
      category: 'wash',
      description: 'Complete care inside and out',
      duration: '60 mins',
      basePrice: 599,
      features: ['Exterior wash', 'Interior vacuuming', 'Dashboard cleaning', 'Tire shine'],
      popular: true
    },
    {
      id: 'full-detailing',
      name: 'Full Detailing',
      category: 'wash',
      description: 'Professional deep cleaning',
      duration: '90 mins',
      basePrice: 999,
      features: ['Complete wash', 'Wax application', 'Deep interior cleaning', 'Polish']
    },
    {
      id: 'emergency-roadside',
      name: 'Emergency Roadside',
      category: 'mechanic',
      description: 'Immediate assistance for breakdowns',
      duration: '30 mins',
      basePrice: 799,
      features: ['30 min response', 'On-spot diagnosis', 'Basic repairs', '24/7 availability']
    },
    {
      id: 'engine-diagnostics',
      name: 'Engine Diagnostics',
      category: 'mechanic',
      description: 'Complete engine health checkup',
      duration: '60-120 mins',
      basePrice: 1299,
      features: ['Computer diagnostics', 'Error code reading', 'Performance analysis', 'Report provided']
    },
    {
      id: 'tire-services',
      name: 'Tire Services',
      category: 'mechanic',
      description: 'Puncture repair and tire replacement',
      duration: '30-60 mins',
      basePrice: 499,
      features: ['Puncture repair', 'Tire replacement', 'Balancing', 'Pressure check']
    }
  ];

  const handleServiceToggle = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    onServicesChange(newServices);
  };

  const addCustomService = () => {
    if (customService.name && customService.price > 0) {
      const customId = `custom-${Date.now()}`;
      onServicesChange([...selectedServices, customId]);
      
      // Reset form
      setCustomService({
        name: '',
        description: '',
        duration: '',
        price: 0,
        category: 'wash'
      });
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const isSelected = selectedServices.includes(service.id);
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleServiceToggle(service.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {service.category === 'wash' ? (
                <Car className="h-5 w-5 text-blue-600" />
              ) : (
                <Wrench className="h-5 w-5 text-gray-600" />
              )}
              <CardTitle className="text-lg">{service.name}</CardTitle>
            </div>
            {service.popular && (
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          <p className="text-gray-600 text-sm">{service.description}</p>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>{service.duration}</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              ₹{service.basePrice}
            </div>
          </div>
          
          <ul className="space-y-1 text-sm text-gray-600">
            {service.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>
                {feature}
              </li>
            ))}
          </ul>
          
          {isSelected && (
            <div className="mt-4 p-3 bg-white rounded border">
              <Label className="text-sm font-medium">Your Price (₹)</Label>
              <Input
                type="number"
                placeholder="Enter your price"
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Wash Services */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Car className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Car Wash Services</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedServices
            .filter(service => service.category === 'wash')
            .map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
        </div>
      </div>

      {/* Mechanic Services */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Wrench className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-semibold">Mechanic Services</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedServices
            .filter(service => service.category === 'mechanic')
            .map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
        </div>
      </div>

      {/* Add Custom Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Custom Service</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Service Name</Label>
              <Input
                value={customService.name}
                onChange={(e) => setCustomService({...customService, name: e.target.value})}
                placeholder="e.g., Paint Protection"
              />
            </div>
            <div>
              <Label>Base Price (₹)</Label>
              <Input
                type="number"
                value={customService.price || ''}
                onChange={(e) => setCustomService({...customService, price: Number(e.target.value)})}
                placeholder="Enter price"
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={customService.description}
              onChange={(e) => setCustomService({...customService, description: e.target.value})}
              placeholder="Describe your service..."
              rows={2}
            />
          </div>
          <Button onClick={addCustomService} className="w-full">
            Add Service
          </Button>
        </CardContent>
      </Card>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Services ({selectedServices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map(serviceId => {
                const service = predefinedServices.find(s => s.id === serviceId);
                return service ? (
                  <Badge key={serviceId} variant="secondary" className="flex items-center space-x-1">
                    <span>{service.name}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleServiceToggle(serviceId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceOnboarding;
