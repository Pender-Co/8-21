import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-soft-sky/50 p-12 rounded-3xl relative">
            <Quote className="h-12 w-12 text-forest/20 absolute top-6 left-6" />
            
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-accent-lime fill-current" />
              ))}
            </div>
            
            <blockquote className="text-2xl md:text-3xl font-dm-sans font-semibold text-dark-slate mb-8 leading-relaxed">
              "TradoHQ cut our scheduling time in half and doubled our efficiency. My crew loves how simple it is to use, and our customers appreciate the real-time updates."
            </blockquote>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop" 
                  alt="Alex Rodriguez" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-dm-sans font-bold text-dark-slate text-lg">Alex Rodriguez</p>
                <p className="text-gray-600 font-inter">Owner, Mountain View Landscapes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;