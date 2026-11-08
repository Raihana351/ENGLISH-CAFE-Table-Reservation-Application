import React, { useState } from 'react';

interface GalleryImage {
  id: string;
  title: string;
  category: 'interior' | 'breakfast' | 'afternoon_tea' | 'bakery';
  src: string;
  alt: string;
  description: string;
}

const GALLERY_ITEMS: GalleryImage[] = [
  {
    id: 'g1',
    title: 'English Cafe Dining Room',
    category: 'interior',
    src: '/src/assets/images/english_cafe_hero_1794120730566.jpg',
    alt: 'English Cafe dining room with vintage oak paneling and green leather banquettes',
    description: 'Heritage oak architectural features, warm brass sconces, and natural Mayfair sunlight.'
  },
  {
    id: 'g2',
    title: 'The Full English Spread',
    category: 'breakfast',
    src: '/src/assets/images/english_breakfast_spread_1794120730702.jpg',
    alt: 'Traditional full English breakfast with artisan Cumberland sausage and fried eggs',
    description: 'Clarence Court golden eggs, Cumberland sausages, baked beans, and buttered toast.'
  },
  {
    id: 'g3',
    title: 'The Royal Mayfair Afternoon Tea',
    category: 'afternoon_tea',
    src: '/src/assets/images/afternoon_tea_tier_1794120731442.jpg',
    alt: 'Three-tier afternoon tea silver stand with scones and finger sandwiches',
    description: 'Tiered presentation with warm scones, Cornish clotted cream, and finger sandwiches.'
  },
  {
    id: 'g4',
    title: 'Artisan Pastry Counter',
    category: 'bakery',
    src: '/src/assets/images/artisan_pastries_coffee_1794120732198.jpg',
    alt: 'Freshly baked Victoria sponge cake, sausage roll, and espresso on marble counter',
    description: 'Baked fresh daily: Victoria sponge, flaky rough puff sausage rolls, and espresso.'
  },
  {
    id: 'g5',
    title: 'Cozy Cafe Dining Tables',
    category: 'interior',
    src: '/src/assets/images/english_cafe_dining_room_1794120731432.jpg',
    alt: 'Spacious dining room with crisp white tablecloths and forest green seating',
    description: 'Linen table service tailored for both intimate couples and celebratory gatherings.'
  }
];

export const GallerySection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'interior' | 'breakfast' | 'afternoon_tea' | 'bakery'>('all');
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);

  const filtered = filter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === filter);

  return (
    <section className="py-16 bg-[#FDFBF7] border-b border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs uppercase tracking-widest text-[#7A6A5E] font-medium mb-2">
            Visual Story & Atmosphere
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1B3B2B] tracking-tight">
            The Gallery
          </h2>
          <p className="text-sm sm:text-base text-[#5A4B42] mt-3">
            A glimpse into the quiet elegance of our Mayfair dining rooms and morning bakes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-[#F7F4EB] rounded-lg max-w-lg mx-auto mb-12 border border-[#E8E2D2]">
          {[
            { key: 'all', label: 'All Photos' },
            { key: 'interior', label: 'Dining Rooms' },
            { key: 'breakfast', label: 'Breakfast' },
            { key: 'afternoon_tea', label: 'Afternoon Tea' },
            { key: 'bakery', label: 'Bakery' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                filter === tab.key
                  ? 'bg-[#1B3B2B] text-white shadow-xs'
                  : 'text-[#5A4B42] hover:text-[#1B3B2B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(img => (
            <div
              key={img.id}
              onClick={() => setSelectedImg(img)}
              className="bg-white border border-[#E8E2D2] rounded-lg overflow-hidden cursor-pointer group hover:shadow-md transition-all text-left"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4">
                <h4 className="font-editorial text-lg font-medium text-[#1B3B2B] mb-1">{img.title}</h4>
                <p className="text-xs text-[#5A4B42] leading-relaxed">{img.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImg && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedImg(null)}
          >
            <div
              className="bg-[#FDFBF7] max-w-3xl w-full rounded-lg overflow-hidden border border-[#E8E2D2] text-left"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black">
                <img
                  src={selectedImg.src}
                  alt={selectedImg.alt}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 flex justify-between items-start">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">{selectedImg.title}</h3>
                  <p className="text-sm text-[#5A4B42] mt-1.5">{selectedImg.description}</p>
                </div>
                <button
                  onClick={() => setSelectedImg(null)}
                  className="px-3 py-1.5 border border-[#D8D2C2] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F7F4EB] text-[#2C221E] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
