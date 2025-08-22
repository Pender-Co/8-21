import React from 'react';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$39',
      description: 'Perfect for solo operators and small crews',
      features: ['Up to 5 team members', 'Basic scheduling', 'Mobile app access', 'Email support'],
      popular: false
    },
    {
      name: 'Pro',
      price: '$79',
      description: 'Best for growing service businesses',
      features: ['Up to 20 team members', 'Advanced route planning', 'GPS tracking', 'Priority support', 'Custom branding'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Tailored solutions for large operations',
      features: ['Unlimited team members', 'API access', 'Custom integrations', 'Dedicated support', 'Advanced analytics'],
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-soft-sky to-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-dm-sans font-bold text-dark-slate mb-4">
            Simple, <span className="text-forest">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-gray-600 font-inter max-w-2xl mx-auto mb-8">
            Affordable pricing for landscaping, lawn care, and snow removal businesses. No credit card required for trial.
          </p>
          <div className="inline-flex items-center bg-accent-lime/20 px-6 py-3 rounded-full">
            <span className="text-forest font-inter font-semibold">✨ 14-day free trial included</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white p-8 rounded-2xl relative transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-2 border-forest shadow-xl' 
                  : 'border border-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-forest text-white px-6 py-2 rounded-full">
                  <span className="font-inter font-semibold text-sm">Most Popular</span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-dm-sans font-bold text-dark-slate mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-dm-sans font-bold text-forest">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-600 font-inter">/month</span>}
                </div>
                <p className="text-gray-600 font-inter">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-forest mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-inter">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-4 rounded-lg font-inter font-semibold transition-all duration-200 hover:scale-105 ${
                  plan.popular
                    ? 'bg-forest text-white hover:bg-forest/90'
                    : 'border-2 border-forest text-forest hover:bg-forest hover:text-white'
                }`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;