import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Can I use TradoHQ for both snow removal and landscaping?',
      answer: 'Absolutely! TradoHQ is specifically designed for outdoor service businesses. Manage landscaping crews in summer, snow removal teams in winter, and lawn care services year-round. Track seasonal equipment, manage different service types, and handle crew scheduling all in one platform.'
    },
    {
      question: 'Do my workers need separate accounts?',
      answer: 'Your landscaping and snow removal crews get access through the TradoHQ mobile app with simple login credentials. Workers can clock in/out at job sites, view their daily routes, update job status, take before/after photos, and communicate with the office. Perfect for seasonal workers who need quick, easy access.'
    },
    {
      question: 'What happens after the trial ends?',
      answer: 'Your 14-day free trial includes full access to all features - route planning, crew tracking, invoicing, and customer management. After the trial, choose a plan that fits your crew size and service area. All your customer data, job history, and crew information stays secure. No long-term contracts, perfect for seasonal businesses.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-dm-sans font-bold text-dark-slate mb-4">
            Frequently Asked <span className="text-forest">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 font-inter">
            Get answers to common questions about TradoHQ
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-soft-sky/20 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-soft-sky/30"
            >
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-dm-sans font-semibold text-dark-slate pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <Minus className="h-6 w-6 text-forest flex-shrink-0" />
                ) : (
                  <Plus className="h-6 w-6 text-forest flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-gray-600 font-inter leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;