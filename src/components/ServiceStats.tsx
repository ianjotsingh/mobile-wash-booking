
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, Clock, Star } from 'lucide-react';

const ServiceStats = () => {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Happy Customers',
      color: 'text-blue-600'
    },
    {
      icon: MapPin,
      value: '25+',
      label: 'Cities Covered',
      color: 'text-emerald-600'
    },
    {
      icon: Clock,
      value: '30 min',
      label: 'Average Response',
      color: 'text-orange-600'
    },
    {
      icon: Star,
      value: '4.8/5',
      label: 'Average Rating',
      color: 'text-yellow-600'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            Trusted by Thousands of Customers
          </h3>
          <p className="text-gray-300 text-lg">
            We're committed to providing the best automotive services across India
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceStats;
