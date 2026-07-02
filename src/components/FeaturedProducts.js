import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';

const FeaturedProducts = () => {
  const { visibleProducts: products } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'ALL PRODUCTS' },
    { id: 'fruits', name: 'FRUITS' },
    { id: 'vegetables', name: 'VEGETABLES' },
    { id: 'pantry', name: 'BEAUTY' },
    { id: 'nuts', name: 'OTHERS' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-earth-800 uppercase tracking-wider mb-4">
            FEATURED PRODUCTS
          </h2>
          <div className="flex justify-center">
            <svg width="120" height="12" viewBox="0 0 120 12" className="text-primary-500">
              {[...Array(15)].map((_, i) => (
                <rect key={i} x={i * 8} y={6 - Math.abs(6 - i % 12) / 2} width="4" height={Math.abs(6 - i % 12)} fill="currentColor" rx="1" />
              ))}
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 md:px-8 md:py-3 text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-earth-100 text-earth-500 hover:bg-earth-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;