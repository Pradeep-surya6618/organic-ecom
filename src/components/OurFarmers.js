import React from 'react';

const farmers = [
  {
    name: 'Rebecca Garzany',
    role: 'Pastoral Farmer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    description: 'Praising pain was born and I will give you a complete account of the system.'
  },
  {
    name: 'George William',
    role: 'Arable Farmer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    description: 'Praising pain was born and I will give you a complete account of the system.'
  },
  {
    name: 'Giana Fernando',
    role: 'Farm Manager',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    description: 'Praising pain was born and I will give you a complete account of the system.'
  }
];

const OurFarmers = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-earth-800 uppercase tracking-wider mb-4">
            OUR FARMERS
          </h2>
          <div className="flex justify-center">
            <svg width="120" height="12" viewBox="0 0 120 12" className="text-primary-500">
              {[...Array(15)].map((_, i) => (
                <rect key={i} x={i * 8} y={6 - Math.abs(6 - i % 12) / 2} width="4" height={Math.abs(6 - i % 12)} fill="currentColor" rx="1" />
              ))}
            </svg>
          </div>
        </div>

        {/* Farmers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {farmers.map((farmer, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6 mx-auto w-48 h-48 md:w-56 md:h-56 overflow-hidden">
                <img
                  src={farmer.image}
                  alt={farmer.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/30 transition-all duration-300" />
              </div>
              <h3 className="text-xl font-bold text-earth-800 mb-1">{farmer.name}</h3>
              <p className="text-primary-500 text-sm font-medium mb-3">{farmer.role}</p>
              <p className="text-earth-400 text-sm leading-relaxed max-w-xs mx-auto">
                {farmer.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurFarmers;