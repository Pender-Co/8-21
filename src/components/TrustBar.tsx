import React from 'react';

const TrustBar = () => {
  return (
    <section className="bg-neutral-stone py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gray-500 font-inter text-lg">Trusted by 1,000+ service pros across the U.S.</p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
          <div className="bg-white h-16 w-40 rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
            <img 
              src="https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets//20250803_2133_EverTurf%20Logo%20Design_simple_compose_01k1sbat5pf03s517ke1ysr5jz%20(1).png" 
              alt="EverTurf Solutions Landscaping" 
              className="h-10 w-32 object-cover rounded opacity-70"
            />
          </div>
          <div className="bg-white h-16 w-40 rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
            <img 
              src="https://uquwbbuhabutqqblyybr.supabase.co/storage/v1/object/public/assets/wildEdgeOutdoors.jpg" 
              alt="WildEdge Outdoors Logo" 
              className="h-10 w-32 object-cover rounded opacity-70"
            />
          </div>
          <div className="bg-white h-16 w-40 rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
            <img 
              src="https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=160&h=64&fit=crop" 
              alt="Yard Maintenance" 
              className="h-10 w-32 object-cover rounded opacity-70"
            />
          </div>
          <div className="bg-white h-16 w-40 rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
            <img 
              src="https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=160&h=64&fit=crop" 
              alt="Landscape Design" 
              className="h-10 w-32 object-cover rounded opacity-70"
            />
          </div>
          <div className="bg-white h-16 w-40 rounded-lg shadow-sm flex items-center justify-center border border-gray-200">
            <img 
              src="https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=160&h=64&fit=crop" 
              alt="Winter Services" 
              className="h-10 w-32 object-cover rounded opacity-70"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;