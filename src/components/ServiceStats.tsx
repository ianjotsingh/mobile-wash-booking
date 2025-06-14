
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, Clock, Star } from 'lucide-react';

const ServiceStats = () => {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Happy Customers',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    },
    {
      icon: MapPin,
      value: '25+',
      label: 'Cities Covered',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Clock,
      value: '30 min',
      label: 'Average Response',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    },
    {
      icon: Star,
      value: '4.8/5',
      label: 'Average Rating',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by thousands
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We're committed to providing the best automotive services with unmatched quality and reliability
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border border-gray-200 text-center hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 ${stat.bgColor} rounded-full`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600 text-base font-medium">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Simple trust indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center space-x-8 space-y-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Available</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Verified Professionals</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
              <span className="text-sm font-medium">Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceStats;
