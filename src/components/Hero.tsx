import React from 'react';
import { Calendar, Users, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreMenu }) => {
  return (
    <section className="relative bg-[#FDFBF7] overflow-hidden pt-6 pb-16 lg:py-20 border-b border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-xl bg-white border border-[#E8E2D2] p-1.5 shadow-xs shrink-0 flex items-center justify-center">
                <img
                  src="/assets/aistudio/English_Cafe_Heritage_Emblem_544f6764.png"
                  alt="English Cafe Heritage Emblem"
                  className="w-full h-full aspect-square object-contain"
                />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-[#7A6A5E] font-medium">
                  Mayfair, London · Established Hospitality
                </div>
                <div className="text-xs text-[#1B3B2B] font-serif italic mt-0.5">
                  Good Food · Great Coffee · Warm Company
                </div>
              </div>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#1B3B2B] leading-[1.12] mb-6">
              A timeless sanctuary for British breakfast, luncheon & afternoon tea.
            </h1>

            <p className="text-base sm:text-lg text-[#5A4B42] leading-relaxed max-w-2xl mb-8">
              Step into our welcoming cafe where freshly baked scones, hearty breakfasts, and artisan coffees meet authentic British hospitality. Real-time table allocation with direct booking confirmation.
            </p>

            {/* Quick Action Strip */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={onBookClick}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-sm font-medium tracking-wide rounded-md transition-all cursor-pointer shadow-sm group"
              >
                <Calendar className="w-4 h-4 text-[#C5A059]" />
                <span>Reserve Table Online</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreMenu}
                className="px-6 py-3.5 bg-white hover:bg-[#F7F4EB] text-[#2C221E] border border-[#D8D2C2] text-sm font-medium rounded-md transition-colors cursor-pointer"
              >
                Explore Current Menu
              </button>
            </div>

            {/* Trust Markers: Claim-to-Proof Adjacency */}
            <div className="pt-6 border-t border-[#E8E2D2] grid grid-cols-3 gap-6 text-left">
              <div>
                <div className="font-editorial text-2xl font-semibold text-[#1B3B2B] tabular-nums">100%</div>
                <div className="text-xs text-[#7A6A5E] mt-0.5">Live Table Allocation</div>
              </div>
              <div>
                <div className="font-editorial text-2xl font-semibold text-[#1B3B2B] tabular-nums">15 min</div>
                <div className="text-xs text-[#7A6A5E] mt-0.5">Seating Turn Buffer</div>
              </div>
              <div>
                <div className="font-editorial text-2xl font-semibold text-[#1B3B2B] tabular-nums">10 Tables</div>
                <div className="text-xs text-[#7A6A5E] mt-0.5">Cafe Dining Area</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden shadow-lg border border-[#E8E2D2] aspect-[4/3] lg:aspect-[3/4]">
              <img
                src="/src/assets/images/english_cafe_hero_1794120730566.jpg"
                alt="English Cafe interior dining room with heritage oak and comfortable seating"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Photo Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                <div className="font-medium text-white/95">The English Cafe Dining Room</div>
                <div className="text-white/75 text-[11px]">14 Royal Crescent, Mayfair, London W1</div>
              </div>
            </div>

            {/* Subtle floating badge adhering to anti-slop rules (unboxed text inside clean card) */}
            <div className="absolute -bottom-4 -left-4 bg-[#F7F4EB] border border-[#E8E2D2] p-3 rounded-lg shadow-sm hidden sm:flex items-center gap-2.5 max-w-xs">
              <ShieldCheck className="w-5 h-5 text-[#1B3B2B] shrink-0" />
              <div className="text-xs text-[#2C221E] leading-tight">
                <span className="font-semibold block">Verified Table Locking</span>
                <span>Protected against double-bookings</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
