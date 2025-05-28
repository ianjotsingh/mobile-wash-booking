
import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';

const Index = () => {
  const services = [
    {
      title: "Basic Wash",
      description: "Essential exterior cleaning",
      price: "$29",
      duration: "30 mins",
      features: [
        "Exterior wash & rinse",
        "Wheel cleaning",
        "Basic interior vacuum",
        "Window cleaning"
      ]
    },
    {
      title: "Premium Wash",
      description: "Complete interior & exterior",
      price: "$59",
      duration: "60 mins",
      popular: true,
      features: [
        "Everything in Basic",
        "Interior deep cleaning",
        "Dashboard & console wipe",
        "Tire shine",
        "Air freshener"
      ]
    },
    {
      title: "Full Detailing",
      description: "Professional detailing service",
      price: "$129",
      duration: "2-3 hours",
      features: [
        "Everything in Premium",
        "Paint protection wax",
        "Engine bay cleaning",
        "Leather conditioning",
        "Steam cleaning"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      
      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Service
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional car wash services delivered to your location. 
              All our partners are verified and insured.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Getting your car washed has never been easier
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Choose Location",
                description: "Enter where you want your car washed - home, office, or anywhere convenient"
              },
              {
                step: "2", 
                title: "Select Time",
                description: "Pick a date and time slot that works best for your schedule"
              },
              {
                step: "3",
                title: "Book Service",
                description: "Choose your service package and confirm your booking details"
              },
              {
                step: "4",
                title: "Relax & Enjoy",
                description: "Our verified partner arrives and makes your car sparkle while you relax"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their car care needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors">
              Book Your First Wash
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg text-lg transition-colors">
              Become a Partner
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">WashWave</h3>
              <p className="text-gray-400">
                Premium car wash services at your doorstep. Trusted by thousands of customers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Basic Wash</li>
                <li>Premium Wash</li>
                <li>Full Detailing</li>
                <li>Business Accounts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Become a Partner</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Track Booking</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WashWave. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
