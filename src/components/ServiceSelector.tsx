
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Wrench, Clock, Star, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  duration: string;
  category: 'wash' | 'mechanic';
  popular?: boolean;
  emergency?: boolean;
}

const ServiceSelector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const carWashServices: Service[] = [
    {
      id: 'basic-wash',
      title: 'Basic Wash',
      description: 'Essential exterior cleaning for your vehicle',
      features: ['Exterior wash', 'Tire cleaning', 'Basic drying'],
      duration: '30 mins',
      category: 'wash'
    },
    {
      id: 'premium-wash',
      title: 'Premium Wash',
      description: 'Complete care inside and out',
      features: ['Exterior wash', 'Interior vacuuming', 'Dashboard cleaning', 'Tire shine'],
      duration: '60 mins',
      category: 'wash',
      popular: true
    },
    {
      id: 'full-detailing',
      title: 'Full Detailing',
      description: 'Professional deep cleaning service',
      features: ['Complete wash', 'Wax application', 'Deep interior cleaning', 'Polish'],
      duration: '90 mins',
      category: 'wash'
    },
    {
      id: 'interior-only',
      title: 'Interior Only',
      description: 'Deep interior cleaning and care',
      features: ['Deep vacuuming', 'Upholstery cleaning', 'Dashboard polish', 'Air freshening'],
      duration: '45 mins',
      category: 'wash'
    }
  ];

  const mechanicServices: Service[] = [
    {
      id: 'emergency-roadside',
      title: 'Emergency Roadside',
      description: 'Immediate assistance for breakdowns',
      features: ['30 min response', 'On-spot diagnosis', 'Basic repairs', '24/7 availability'],
      duration: '30 mins',
      category: 'mechanic',
      emergency: true
    },
    {
      id: 'engine-diagnostics',
      title: 'Engine Diagnostics',
      description: 'Complete engine health checkup',
      features: ['Computer diagnostics', 'Error code reading', 'Performance analysis', 'Report provided'],
      duration: '60-120 mins',
      category: 'mechanic'
    },
    {
      id: 'tire-services',
      title: 'Tire Services',
      description: 'Puncture repair and tire replacement',
      features: ['Puncture repair', 'Tire replacement', 'Balancing', 'Pressure check'],
      duration: '30-60 mins',
      category: 'mechanic'
    },
    {
      id: 'battery-services',
      title: 'Battery Services',
      description: 'Battery testing and replacement',
      features: ['Jump start', 'Battery testing', 'Replacement', 'Installation'],
      duration: '30-45 mins',
      category: 'mechanic'
    },
    {
      id: 'oil-change',
      title: 'Oil Change',
      description: 'Engine oil and filter replacement',
      features: ['Oil drain & refill', 'Filter replacement', 'Quality oils', 'Disposal included'],
      duration: '45-60 mins',
      category: 'mechanic'
    },
    {
      id: 'ac-repair',
      title: 'AC Repair',
      description: 'Air conditioning service and repair',
      features: ['Gas refill', 'Compressor check', 'Filter cleaning', 'Performance test'],
      duration: '60-90 mins',
      category: 'mechanic'
    }
  ];

  const handleServiceSelect = (service: Service) => {
    try {
      // Store only service info, pricing will come from companies
      const serviceData = {
        id: service.id,
        title: service.title,
        description: service.description,
        features: service.features,
        duration: service.duration,
        category: service.category,
        popular: service.popular,
        emergency: service.emergency
      };
      
      const serviceDataString = JSON.stringify(serviceData);
      console.log('Storing service data for marketplace selection:', serviceDataString);
      localStorage.setItem('selectedService', serviceDataString);
      
      // Navigate to booking flow where companies and their pricing will be shown
      navigate('/booking');
    } catch (error) {
      console.error('Error storing service data:', error);
      navigate('/booking');
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const getCardStyling = () => {
      if (service.emergency) {
        return {
          cardClass: "relative cursor-pointer transition-all duration-200 hover:shadow-md bg-red-50 border border-red-200 hover:border-red-300",
          badge: "absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium",
          icon: "w-5 h-5 text-red-600",
          buttonColor: "bg-red-600 hover:bg-red-700"
        };
      } else if (service.category === 'wash') {
        return {
          cardClass: "relative cursor-pointer transition-all duration-200 hover:shadow-md bg-blue-50 border border-blue-200 hover:border-blue-300",
          badge: service.popular ? "absolute -top-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-medium" : "",
          icon: "w-5 h-5 text-blue-600",
          buttonColor: "bg-blue-600 hover:bg-blue-700"
        };
      } else {
        return {
          cardClass: "relative cursor-pointer transition-all duration-200 hover:shadow-md bg-gray-50 border border-gray-200 hover:border-gray-300",
          badge: service.popular ? "absolute -top-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-medium" : "",
          icon: "w-5 h-5 text-gray-700",
          buttonColor: "bg-gray-700 hover:bg-gray-800"
        };
      }
    };

    const styling = getCardStyling();

    return (
      <Card 
        className={styling.cardClass}
        onClick={() => handleServiceSelect(service)}
      >
        {(service.popular && styling.badge) && (
          <div className={styling.badge}>
            <Star className="w-3 h-3 inline mr-1" />
            <span>Popular</span>
          </div>
        )}
        {service.emergency && (
          <div className={styling.badge}>
            <Zap className="w-3 h-3 inline mr-1" />
            <span>Emergency</span>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">{service.title}</span>
            <div className="flex items-center space-x-1">
              {service.category === 'wash' ? (
                <Car className={styling.icon} />
              ) : (
                <Wrench className={styling.icon} />
              )}
            </div>
          </CardTitle>
          <p className="text-gray-600 text-sm">{service.description}</p>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-600">Compare Providers</span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>{service.duration}</span>
            </div>
          </div>
          
          <ul className="space-y-2 mb-4">
            {service.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>
                {feature}
              </li>
            ))}
          </ul>
          
          <Button className={`w-full ${styling.buttonColor} text-white font-medium transition-all duration-200`}>
            View Providers & Prices
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Car Wash Services Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Car Wash Services
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Compare prices from multiple providers in your area
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {carWashServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Mechanic Services Section */}
        <section>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Wrench className="w-8 h-8 text-gray-700" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Mechanic Services
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the best rates for automotive repair and maintenance services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanicServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Service Areas */}
        <section className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-2 bg-white rounded-full border border-gray-200">
                <MapPin className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">Service Areas</h3>
            </div>
            <p className="text-gray-600">Available across major cities in India</p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
            {['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'].map((city) => (
              <div key={city} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <span className="text-sm font-medium text-gray-700">{city}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServiceSelector;
