import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <img 
              src="https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//TradoHQ.png" 
              alt="TradoHQ Logo" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-dm-sans font-bold text-dark-slate">TradoHQ</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-dark-slate hover:text-forest transition-colors font-inter font-medium">Features</a>
            <a href="#pricing" className="text-dark-slate hover:text-forest transition-colors font-inter font-medium">Pricing</a>
            <a href="#about" className="text-dark-slate hover:text-forest transition-colors font-inter font-medium">About</a>
            <a href="#contact" className="text-dark-slate hover:text-forest transition-colors font-inter font-medium">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/auth/signin')}
              className="text-dark-slate hover:text-forest transition-colors font-inter font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/auth/signup')}
              className="bg-forest text-white px-6 py-2 rounded-lg hover:bg-forest/90 transition-all duration-200 hover:scale-105 font-inter font-medium"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;