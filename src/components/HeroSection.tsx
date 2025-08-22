import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  // Array of image URLs
  const backgroundImages = [
    'https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//bermix-studio-nZZfP9QiQ6w-unsplash.jpg',
    'https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//fraem-gmbh-LVJnIiIeyO0-unsplash.jpg',
    'https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//james-kovin-qqLxF3M-MA8-unsplash.jpg',
    'https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//jared-muller-EkhWxU_pgLo-unsplash.jpg'
  ];

  // Pick a random image when component mounts
  const randomImage = useMemo(() => {
    const index = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[index];
  }, []);

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-soft-sky to-white">
      <div className="absolute inset-0 bg-black/10 z-0"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${randomImage})`
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/80 z-10"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-dm-sans font-bold text-dark-slate leading-tight mb-6">
            Power Your <span className="text-forest">Outdoor Service</span> Business with TradoHQ
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 font-inter leading-relaxed mb-8">
            Smart scheduling, team tracking, invoicing, and more — all in one simple dashboard designed for landscaping, lawn care, and snow removal pros.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button 
              onClick={() => navigate('/auth/signup')}
              className="bg-forest text-white px-8 py-4 rounded-lg hover:bg-forest/90 transition-all duration-200 hover:scale-105 font-inter font-semibold text-lg flex items-center justify-center group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-forest text-forest px-8 py-4 rounded-lg hover:bg-forest hover:text-white transition-all duration-200 font-inter font-semibold text-lg flex items-center justify-center group">
              <Play className="mr-2 h-5 w-5" />
              Book Demo
            </button>
          </div>

          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 bg-forest rounded-full border-2 border-white"></div>
              <div className="w-10 h-10 bg-accent-lime rounded-full border-2 border-white"></div>
              <div className="w-10 h-10 bg-gray-400 rounded-full border-2 border-white"></div>
            </div>
            <span className="font-inter">Join 1,000+ service pros already growing with TradoHQ</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
