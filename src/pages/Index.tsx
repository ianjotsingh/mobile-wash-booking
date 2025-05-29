
import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';

const Index = () => {
  const services = [
    {
      title: "Basic Wash",
      description: "Essential cleaning for your vehicle",
      price: "₹299",
      features: ["Exterior wash", "Vacuum cleaning", "Tire cleaning"],
      duration: "30 minutes"
    },
    {
      title: "Premium Wash",
      description: "Complete care for your car inside and out",
      price: "₹599",
      features: ["Complete exterior wash", "Interior cleaning", "Dashboard polish", "Tire shine"],
      duration: "60 minutes",
      popular: true
    },
    {
      title: "Deluxe Detailing",
      description: "Full professional detailing service",
      price: "₹999",
      features: ["Full car wash", "Interior detailing", "Wax application", "Engine cleaning"],
      duration: "90 minutes"
    }
  ];

  const handleScroll = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Choose the perfect wash for your car</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
