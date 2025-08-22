import React from 'react';
import { Plus, Users, CheckCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Plus,
      title: 'Add a Job',
      description: 'Create jobs quickly with customer details, location, and service requirements.'
    },
    {
      icon: Users,
      title: 'Assign a Crew',
      description: 'Match the right team to each job based on skills, location, and availability.'
    },
    {
      icon: CheckCircle,
      title: 'Track & Bill Automatically',
      description: 'Monitor progress in real-time and generate invoices instantly upon completion.'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-soft-sky to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-dm-sans font-bold text-dark-slate mb-4">
            How <span className="text-forest">TradoHQ</span> Works
          </h2>
          <p className="text-xl text-gray-600 font-inter max-w-2xl mx-auto">
            Three simple steps to streamline your landscaping, lawn care, and snow removal operations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 right-0 transform translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-forest to-accent-lime z-0"></div>
              )}
              
              <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-forest to-accent-lime p-4 rounded-xl inline-block mb-6">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-forest text-white w-8 h-8 rounded-full flex items-center justify-center font-dm-sans font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-dm-sans font-bold text-dark-slate mb-4">{step.title}</h3>
                <p className="text-gray-600 font-inter leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;