
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, Clock, Star } from 'lucide-react';

const ServiceStats = () => {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Happy Customers',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: MapPin,
      value: '25+',
      label: 'Cities Covered',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      icon: Clock,
      value: '30 min',
      label: 'Average Response',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Star,
      value: '4.8/5',
      label: 'Average Rating',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzNzM3MzciIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-6">
            Trusted by Thousands of 
            <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent"> Customers</span>
          </h3>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            We're committed to providing the best automotive services across India with unmatched quality and reliability
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 ${stat.bgColor} rounded-full`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-300 text-base font-medium">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Additional trust indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center space-x-8 space-y-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">24/7 Available</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Verified Professionals</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceStats;
