import React from 'react';
import { CAFE_INFO } from '../constants/cafeData';

interface FooterProps {
  onNavClick: (tab: 'home' | 'about' | 'menu' | 'gallery' | 'reservations' | 'contact' | 'admin' | 'lookup') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="bg-[#1B3B2B] text-white border-t border-[#244D38] pt-14 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Narrative */}
          <div className="md:col-span-1">
            <div className="w-16 h-16 aspect-square rounded-lg bg-white p-1 mb-3.5 flex items-center justify-center shadow-xs">
              <img
                src="/assets/aistudio/English_Cafe_Heritage_Emblem_544f6764.png"
                alt="English Cafe Logo"
                className="w-full h-full aspect-square object-contain"
              />
            </div>
            <span className="font-editorial text-2xl font-semibold tracking-tight text-[#FDFBF7] block mb-2">
              English Cafe
            </span>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Traditional British dining, artisanal breakfasts, and Royal Mayfair afternoon tea service in a historic Georgian townhouse.
            </p>
            <div className="text-[11px] text-[#D8C7A5]">
              14 Royal Crescent, Mayfair, London W1J 7PT
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#D8C7A5] mb-3">
              Navigation
            </div>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('about')} className="hover:text-white transition-colors cursor-pointer">
                  Our Story & Heritage
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('menu')} className="hover:text-white transition-colors cursor-pointer">
                  The Complete Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('gallery')} className="hover:text-white transition-colors cursor-pointer">
                  Cafe Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Location & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Service Hours */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#D8C7A5] mb-3">
              Service Hours
            </div>
            <ul className="space-y-1.5 text-xs text-white/80">
              {CAFE_INFO.openingHours.map(h => (
                <li key={h.days} className="flex justify-between">
                  <span>{h.days}</span>
                  <span className="font-mono text-white/90 tabular-nums">{h.hours}</span>
                </li>
              ))}
            </ul>
            <div className="text-[11px] text-white/60 mt-3">
              Table reservations held for 15 minutes.
            </div>
          </div>

          {/* Guest Services & Admin Gateway */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#D8C7A5] mb-3">
              Guest Services
            </div>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => onNavClick('reservations')} className="hover:text-white transition-colors cursor-pointer text-[#D8C7A5]">
                  Reserve a Table Online
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('lookup')} className="hover:text-white transition-colors cursor-pointer">
                  Find / Cancel Existing Booking
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavClick('admin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <span>Management Dashboard & Sheets</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Quiet Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-white/60">
          <div>
            © {new Date().getFullYear()} English Cafe London. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Mayfair Dining Ledger</span>
            <span>·</span>
            <span>Google Sheets Cloud Synchronized</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
