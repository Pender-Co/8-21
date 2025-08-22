import React from 'react';
import { Navigation, Clock, FileText, MapPin } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Navigation,
      title: 'Smart Route Planning',
      description: 'Optimize daily routes for lawn care, landscaping, and snow removal. Save fuel costs and increase daily job capacity by up to 40%.'
    },
    {
      icon: Clock,
      title: 'Crew Time Tracking',
      description: 'Track crew hours in real-time with GPS verification. Perfect for seasonal teams and accurate job costing across all outdoor services.'
    },
    {
      icon: FileText,
      title: 'Instant Invoicing',
      description: 'Generate professional invoices immediately after job completion. Automated billing for recurring lawn care and seasonal contracts.'
    },
    {
      icon: MapPin,
      title: 'GPS Check-ins',
      description: 'Verify job completion with location-based check-ins. Send automatic updates to customers for lawn care, landscaping, and snow removal jobs.'
    }
  ];

  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-dm-sans font-bold text-dark-slate mb-4">
            Everything You Need to <span className="text-forest">Grow Your Business</span>
          </h2>
          <p className="text-xl text-gray-600 font-inter max-w-3xl mx-auto">
            TradoHQ combines powerful features with outdoor-friendly design to help service professionals work smarter, not harder.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-soft-sky/30 p-8 rounded-2xl hover:bg-soft-sky/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
            >
              <div className="bg-forest p-4 rounded-xl inline-block mb-6 group-hover:bg-forest/90 transition-colors">
                <benefit.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-dm-sans font-bold text-dark-slate mb-4">{benefit.title}</h3>
              <p className="text-gray-600 font-inter leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;