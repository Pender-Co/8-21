import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const CTABanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-r from-forest to-forest/90 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)'
        }}
      ></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-6xl font-dm-sans font-bold text-white mb-6">
          Join 1,000+ Outdoor Service Pros Already Using <span className="text-accent-lime">TradoHQ</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-white/90 font-inter mb-12 max-w-2xl mx-auto">
          Transform your business today with smart scheduling, team tracking, and instant invoicing - all in one powerful platform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => navigate('/auth/signup')}
            className="bg-accent-lime text-dark-slate px-10 py-4 rounded-lg hover:bg-accent-lime/90 transition-all duration-200 hover:scale-105 font-inter font-bold text-lg flex items-center justify-center group"
          >
            Start Free Trial
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="border-2 border-white text-white px-10 py-4 rounded-lg hover:bg-white hover:text-forest transition-all duration-200 font-inter font-bold text-lg flex items-center justify-center group">
            <Play className="mr-3 h-6 w-6" />
            Book Demo
          </button>
        </div>
        
        <div className="mt-12 flex items-center justify-center space-x-8 text-white/80">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
            <span className="font-inter">14-day free trial</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
            <span className="font-inter">No credit card required</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
            <span className="font-inter">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;