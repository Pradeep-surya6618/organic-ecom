import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    text: 'Who do not know how to pursue an sed pleasure rationally encounter that are extremely win painful nor again is there anyone who loves or pursues or desires obtain pain itself circumstances.',
    name: 'Mark Antony',
    role: 'Designer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
  },
  {
    text: 'Who do not know how to pursue an sed pleasure rationally encounter that are extremely win painful nor again is there anyone who loves or pursues or desires obtain pain itself circumstances.',
    name: 'William Border',
    role: 'Designer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    text: 'Who do not know how to pursue an sed pleasure rationally encounter that are extremely win painful nor again is there anyone who loves or pursues or desires obtain pain itself circumstances.',
    name: 'Jessy Federar',
    role: 'Cor. Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
  }
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1416879595882-3373a1f4a0c4?w=1600&h=700&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-earth-900/80" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-black uppercase tracking-wider mb-4">
              TESTIMONIALS
            </h2>
            <svg width="120" height="12" viewBox="0 0 120 12" className="text-primary-500">
              {[...Array(15)].map((_, i) => (
                <rect key={i} x={i * 8} y={6 - Math.abs(6 - i % 12) / 2} width="4" height={Math.abs(6 - i % 12)} fill="currentColor" rx="1" />
              ))}
            </svg>
          </div>
          <div className="flex gap-2">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-black/30 flex items-center justify-center text-black hover:bg-black hover:text-earth-800 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="w-10 h-10 rounded-full border border-black/30 flex items-center justify-center text-black hover:bg-black hover:text-earth-800 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-primary-500/90 p-8 text-center">
              <p className="text-black/90 text-sm leading-relaxed mb-8 italic">
                {testimonial.text}
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-black/30"
                />
                <div className="text-left">
                  <h4 className="text-black font-bold">{testimonial.name}</h4>
                  <p className="text-black/70 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;