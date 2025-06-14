
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Car, Clock, Star, Search, Filter, Wrench, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MobileHomeProps {
  userLocation: { lat: number; lng: number } | null;
  userAddress: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  popular: boolean;
  features: string[];
}

const MobileHome = ({ userLocation, userAddress }: MobileHomeProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    fetchRecentOrders();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('popular', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const handleServiceSelect = (service: Service) => {
    localStorage.setItem('selectedService', JSON.stringify(service));
    navigate('/booking');
  };

  const handleQuickBook = () => {
    if (services.length > 0) {
      const popularService = services.find(s => s.popular) || services[0];
      handleServiceSelect(popularService);
    }
  };

  const handleSchedule = () => {
    localStorage.setItem('bookingMode', 'schedule');
    navigate('/booking');
  };

  const handleCallMechanic = () => {
    navigate('/mechanic-request');
  };

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">WashCart</h1>
            <p className="text-blue-100">Car wash & mechanic services</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <Car className="h-6 w-6" />
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center space-x-2 bg-blue-500 bg-opacity-30 rounded-lg p-3">
          <MapPin className="h-5 w-5 text-blue-200" />
          <div className="flex-1">
            <p className="text-sm text-blue-100">Service Location</p>
            <p className="font-medium truncate">{userAddress || 'Select your location'}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-100 hover:bg-blue-500">
            Change
          </Button>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-6">
        {/* Quick Book Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button 
                onClick={handleQuickBook}
                className="bg-blue-600 hover:bg-blue-700 h-12"
              >
                <Car className="h-5 w-5 mr-2" />
                Book Wash
              </Button>
              <Button 
                onClick={handleSchedule}
                variant="outline" 
                className="h-12"
              >
                <Clock className="h-5 w-5 mr-2" />
                Schedule
              </Button>
            </div>
            <Button 
              onClick={handleCallMechanic}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12"
            >
              <Wrench className="h-5 w-5 mr-2" />
              Call Mechanic
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex space-x-2 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" size="sm" className="px-3">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Wash Services</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <Card key={service.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          {service.popular && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                        <p className="text-sm text-gray-500">{formatDuration(service.duration)}</p>
                        {service.features && service.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.features.slice(0, 2).map((feature, index) => (
                              <span 
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-600">Price on quote</p>
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => handleServiceSelect(service)}
                        >
                          Get Quote
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Card key={order.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.service_type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">{order.address}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        {order.status === 'completed' && (
                          <Button variant="ghost" size="sm" className="mt-1">
                            Rate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-4 text-center text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent bookings</p>
                <p className="text-sm">Book your first service to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHome;
