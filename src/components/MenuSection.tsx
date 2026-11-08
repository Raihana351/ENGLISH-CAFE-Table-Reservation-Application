import React, { useState } from 'react';
import { MENU_ITEMS, MenuItem } from '../constants/cafeData';

interface MenuSectionProps {
  onReserveClick: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onReserveClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'afternoon_tea' | 'lunch' | 'bakery_beverage'>('all');

  const categories = [
    { key: 'all', label: 'Complete Menu' },
    { key: 'breakfast', label: 'The Full English & Breakfast' },
    { key: 'afternoon_tea', label: 'High Afternoon Tea' },
    { key: 'lunch', label: 'Luncheon & Savouries' },
    { key: 'bakery_beverage', label: 'Patisserie & Fine Teas' }
  ] as const;

  const filteredItems = selectedCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <section className="py-16 bg-[#FDFBF7] border-b border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-[#7A6A5E] font-medium mb-2">
            Seasonal British Cuisine & Tea House
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1B3B2B] tracking-tight">
            Curated Menu & Traditions
          </h2>
          <p className="text-sm sm:text-base text-[#5A4B42] mt-3 leading-relaxed">
            Prepared with ingredients sourced directly from small British heritage farms, day-boat Cornish fisheries, and independent British creameries.
          </p>
        </div>

        {/* Featured Visual Spotlight (3-Card Showcase using our generated high-fidelity images) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white border border-[#E8E2D2] rounded-lg overflow-hidden group">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="/src/assets/images/english_breakfast_spread_1794120730702.jpg"
                alt="Traditional full English breakfast with Cumberland sausages and Clarence Court eggs"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-5 text-left">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider mb-1">Morning Service · 08:00 – 12:00</div>
              <h3 className="font-editorial text-xl font-medium text-[#1B3B2B] mb-1.5">The Full English Breakfast</h3>
              <p className="text-xs text-[#5A4B42] leading-relaxed">
                Artisan Cumberland sausage, Clarence Court golden fried eggs, roasted Portobello mushroom, baked beans in copper & farmhouse sourdough.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E8E2D2] rounded-lg overflow-hidden group">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="/src/assets/images/afternoon_tea_tier_1794120731442.jpg"
                alt="Royal Mayfair High Afternoon Tea tiered stand with warm scones and cucumber sandwiches"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-5 text-left">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider mb-1">Afternoon Tea Service · 12:00 – 18:00</div>
              <h3 className="font-editorial text-xl font-medium text-[#1B3B2B] mb-1.5">The Royal Mayfair Afternoon Tea</h3>
              <p className="text-xs text-[#5A4B42] leading-relaxed">
                Warm buttermilk scones with Rodda’s Cornish clotted cream, delicate smoked salmon & cucumber sandwiches, and handcrafted patisserie.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E8E2D2] rounded-lg overflow-hidden group">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="/src/assets/images/artisan_pastries_coffee_1794120732198.jpg"
                alt="Artisan bakery counter with Victoria sponge, sausage roll, and espresso"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-5 text-left">
              <div className="text-xs text-[#7A6A5E] uppercase tracking-wider mb-1">All Day Bakery & Espresso</div>
              <h3 className="font-editorial text-xl font-medium text-[#1B3B2B] mb-1.5">Heritage Patisserie & Savouries</h3>
              <p className="text-xs text-[#5A4B42] leading-relaxed">
                Warm rough-puff sausage rolls with caramelized onion relish, featherlight Victoria sponge, Eccles cakes, and single-estate coffee.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Filter Control Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-[#F7F4EB] rounded-lg max-w-2xl mx-auto mb-12 border border-[#E8E2D2]">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#1B3B2B] text-white shadow-xs'
                  : 'text-[#5A4B42] hover:text-[#1B3B2B]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-[#E8E2D2] rounded-lg flex flex-col justify-between hover:border-[#1B3B2B]/40 transition-colors"
            >
              <div>
                <div className="flex justify-between items-baseline gap-4 mb-1.5">
                  <h4 className="font-editorial text-lg font-semibold text-[#1B3B2B]">
                    {item.name}
                  </h4>
                  <span className="font-mono text-sm font-semibold text-[#1B3B2B] tabular-nums whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-[#5A4B42] leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {item.dietary && item.dietary.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] text-[#7A6A5E] pt-2 border-t border-[#F7F4EB]">
                  {item.dietary.map((tag, idx) => (
                    <React.Fragment key={tag}>
                      <span>{tag}</span>
                      {idx < item.dietary!.length - 1 && <span aria-hidden="true">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reservation Callout Strip */}
        <div className="mt-14 p-6 bg-[#F7F4EB] border border-[#E8E2D2] rounded-lg max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <h4 className="font-editorial text-lg font-semibold text-[#1B3B2B]">Afternoon Tea & Group Dining</h4>
            <p className="text-xs text-[#5A4B42]">Tables are allocated in real time with automated seating optimization.</p>
          </div>
          <button
            onClick={onReserveClick}
            className="px-6 py-2.5 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            Book Table Online
          </button>
        </div>

      </div>
    </section>
  );
};
