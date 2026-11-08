import React from 'react';
import { Award, Utensils, Coffee, MapPin } from 'lucide-react';

interface AboutSectionProps {
  onReserveClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onReserveClick }) => {
  return (
    <section className="py-16 lg:py-24 bg-[#F7F4EB] border-b border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="text-xs uppercase tracking-widest text-[#7A6A5E] font-medium mb-3">
            British Hospitality & Provenance
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1B3B2B] tracking-tight leading-tight mb-6">
            Preserving the gracious art of English dining since 1928.
          </h2>
          <p className="text-base sm:text-lg text-[#5A4B42] leading-relaxed">
            Nestled inside a Grade-II listed Georgian townhouse in Mayfair, English Cafe was founded on a simple philosophy: honor British culinary heritage with peerless ingredients, hand-poured loose-leaf teas, and genuinely attentive service.
          </p>
        </div>

        {/* 2-Column Split: Image & Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6">
            <div className="rounded-lg overflow-hidden border border-[#E8E2D2] shadow-sm aspect-[4/3]">
              <img
                src="/src/assets/images/english_cafe_dining_room_1794120731432.jpg"
                alt="English Cafe dining room with elegant linen tablecloths and warm lighting"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="bg-white p-6 rounded-lg border border-[#E8E2D2]">
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-[#1B3B2B] shrink-0 mt-1" />
                <div>
                  <h3 className="font-editorial text-lg font-semibold text-[#1B3B2B] mb-1">
                    Authentic British Farm Provenance
                  </h3>
                  <p className="text-xs text-[#5A4B42] leading-relaxed">
                    Our free-range pork is reared by third-generation butchers in Cumbria; our clotted cream is churned in Redruth, Cornwall; and our eggs are pasture-raised Clarence Court Burford Browns.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E8E2D2]">
              <div className="flex items-start gap-4">
                <Coffee className="w-6 h-6 text-[#1B3B2B] shrink-0 mt-1" />
                <div>
                  <h3 className="font-editorial text-lg font-semibold text-[#1B3B2B] mb-1">
                    Rare Loose-Leaf Tea Curation
                  </h3>
                  <p className="text-xs text-[#5A4B42] leading-relaxed">
                    Over eighteen bespoke blends and single-estate harvests steeped at precision temperatures and poured from authentic silver-plated tea pots into vintage bone china.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E8E2D2]">
              <div className="flex items-start gap-4">
                <Utensils className="w-6 h-6 text-[#1B3B2B] shrink-0 mt-1" />
                <div>
                  <h3 className="font-editorial text-lg font-semibold text-[#1B3B2B] mb-1">
                    Automated Seating & Table Assurance
                  </h3>
                  <p className="text-xs text-[#5A4B42] leading-relaxed">
                    Our dedicated booking engine guarantees immediate table allocation with zero double-booking, synchronized directly to our Google Sheets operations ledger.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Quiet Editorial Quote */}
        <div className="mt-16 text-center border-t border-[#E8E2D2] pt-12 max-w-2xl mx-auto">
          <blockquote className="font-editorial italic text-lg sm:text-xl text-[#1B3B2B] leading-relaxed mb-3">
            “There are few hours in life more agreeable than the hour dedicated to the ceremony known as afternoon tea.”
          </blockquote>
          <cite className="text-xs text-[#7A6A5E] uppercase tracking-widest font-medium not-italic">
            — Henry James, The Portrait of a Lady
          </cite>
        </div>

      </div>
    </section>
  );
};
