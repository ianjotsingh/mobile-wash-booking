
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
  price: string;
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
      price: '₹199',
      features: ['Exterior wash', 'Tire cleaning', 'Basic drying'],
      duration: '30 mins',
      category: 'wash'
    },
    {
      id: 'premium-wash',
      title: 'Premium Wash',
      description: 'Complete care inside and out',
      price: '₹399',
      features: ['Exterior wash', 'Interior vacuuming', 'Dashboard cleaning', 'Tire shine'],
      duration: '60 mins',
      category: 'wash',
      popular: true
    },
    {
      id: 'full-detailing',
      title: 'Full Detailing',
      description: 'Professional deep cleaning service',
      price: '₹799',
      features: ['Complete wash', 'Wax application', 'Deep interior cleaning', 'Polish'],
      duration: '90 mins',
      category: 'wash'
    },
    {
      id: 'interior-only',
      title: 'Interior Only',
      description: 'Deep interior cleaning and care',
      price: '₹299',
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
      price: '₹299+',
      features: ['30 min response', 'On-spot diagnosis', 'Basic repairs', '24/7 availability'],
      duration: '30 mins',
      category: 'mechanic',
      emergency: true
    },
    {
      id: 'engine-diagnostics',
      title: 'Engine Diagnostics',
      description: 'Complete engine health checkup',
      price: '₹499',
      features: ['Computer diagnostics', 'Error code reading', 'Performance analysis', 'Report provided'],
      duration: '60-120 mins',
      category: 'mechanic'
    },
    {
      id: 'tire-services',
      title: 'Tire Services',
      description: 'Puncture repair and tire replacement',
      price: '₹199-999',
      features: ['Puncture repair', 'Tire replacement', 'Balancing', 'Pressure check'],
      duration: '30-60 mins',
      category: 'mechanic'
    },
    {
      id: 'battery-services',
      title: 'Battery Services',
      description: 'Battery testing and replacement',
      price: '₹299-1999',
      features: ['Jump start', 'Battery testing', 'Replacement', 'Installation'],
      duration: '30-45 mins',
      category: 'mechanic'
    },
    {
      id: 'oil-change',
      title: 'Oil Change',
      description: 'Engine oil and filter replacement',
      price: '₹699-1299',
      features: ['Oil drain & refill', 'Filter replacement', 'Quality oils', 'Disposal included'],
      duration: '45-60 mins',
      category: 'mechanic'
    },
    {
      id: 'ac-repair',
      title: 'AC Repair',
      description: 'Air conditioning service and repair',
      price: '₹799-2499',
      features: ['Gas refill', 'Compressor check', 'Filter cleaning', 'Performance test'],
      duration: '60-90 mins',
      category: 'mechanic'
    }
  ];

  const handleServiceSelect = (service: Service) => {
    try {
      // Ensure we're storing the complete service object
      const serviceData = {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        features: service.features,
        duration: service.duration,
        category: service.category,
        popular: service.popular,
        emergency: service.emergency
      };
      
      const serviceDataString = JSON.stringify(serviceData);
      console.log('Storing complete service data:', serviceDataString);
      localStorage.setItem('selectedService', serviceDataString);
      
      // Navigate to unified booking flow
      navigate('/booking');
    } catch (error) {
      console.error('Error storing service data:', error);
      // Still navigate but without storing - the booking flow will handle missing data
      navigate('/booking');
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const getCardStyling = () => {
      if (service.emergency) {
        return {
          cardClass: "relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-2 border-emergency-primary",
          badge: "absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emergency-gradient text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg pulse-emergency",
          icon: "w-5 h-5 text-red-600",
          priceColor: "text-red-600"
        };
      } else if (service.category === 'wash') {
        return {
          cardClass: "relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-wash-light border-2 border-wash-primary",
          badge: service.popular ? "absolute -top-3 left-1/2 transform -translate-x-1/2 bg-premium-gradient text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg" : "",
          icon: "w-5 h-5 text-wash-primary",
          priceColor: "text-wash-primary"
        };
      } else {
        return {
          cardClass: "relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-mechanic-light border-2 border-mechanic-primary",
          badge: service.popular ? "absolute -top-3 left-1/2 transform -translate-x-1/2 bg-premium-gradient text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg" : "",
          icon: "w-5 h-5 text-mechanic-primary",
          priceColor: "text-mechanic-primary"
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
            <span>Most Popular</span>
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
            <span className="text-lg font-bold text-gray-800">{service.title}</span>
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
            <span className={`text-2xl font-bold ${styling.priceColor}`}>{service.price}</span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>{service.duration}</span>
            </div>
          </div>
          
          <ul className="space-y-2 mb-4">
            {service.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  service.category === 'wash' ? 'bg-blue-500' : 'bg-orange-500'
                }`}></div>
                {feature}
              </li>
            ))}
          </ul>
          
          <Button className={`w-full font-semibold transition-all duration-300 ${
            service.category === 'wash' 
              ? 'bg-wash-gradient hover:shadow-lg hover:shadow-blue-500/25' 
              : 'bg-mechanic-gradient hover:shadow-lg hover:shadow-orange-500/25'
          } text-white`}>
            Book Now
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Car Wash Services Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-wash-gradient rounded-full">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Car Wash Services
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional car wash services delivered to your location with premium care and attention to detail
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
              <div className="p-3 bg-mechanic-gradient rounded-full">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                Mechanic Services
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert automotive repair and maintenance services with certified mechanics available 24/7
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanicServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Service Areas */}
        <section className="mt-16 bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-2 bg-emerald-100 rounded-full">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Service Areas</h3>
            </div>
            <p className="text-gray-600">We provide services across major cities in India</p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            {['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'].map((city) => (
              <div key={city} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
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
