import React from 'react';
import { Leaf, Facebook, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-slate text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src="https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//TradoHQ.png" 
                alt="TradoHQ Logo" 
                className="h-8 w-auto"
              />
              <span className="text-2xl font-dm-sans font-bold">TradoHQ</span>
            </div>
            <p className="text-gray-300 font-inter leading-relaxed max-w-md mb-6">
              Empowering outdoor service professionals with smart tools to grow their businesses. From landscaping to snow removal, we've got you covered.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-700 p-3 rounded-lg hover:bg-forest transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-700 p-3 rounded-lg hover:bg-forest transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-700 p-3 rounded-lg hover:bg-forest transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-dm-sans font-semibold text-lg mb-6">Product</h4>
            <ul className="space-y-3 font-inter text-gray-300">
              <li><a href="#" className="hover:text-accent-lime transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-accent-lime transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-accent-lime transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-accent-lime transition-colors">Mobile App</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-dm-sans font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3 font-inter text-gray-300">
              <li><a href="#" className="hover:text-accent-lime transition-colors">About</a></li>
              <li><a href="#" className="hover:text-accent-lime transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-accent-lime transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-lime transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 font-inter mb-4 md:mb-0">
            © 2025 TradoHQ. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-gray-400 font-inter">
            <span>Made for outdoor service professionals</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-lime rounded-full animate-pulse"></div>
              <span className="text-accent-lime">Always growing</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;