import React from 'react';
import { Calendar, Shield, Search } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'about' | 'menu' | 'gallery' | 'reservations' | 'contact' | 'admin' | 'lookup';
  setActiveTab: (tab: 'home' | 'about' | 'menu' | 'gallery' | 'reservations' | 'contact' | 'admin' | 'lookup') => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isAdminLoggedIn }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E2D2] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark & 1:1 Emblem */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="w-11 h-11 aspect-square rounded-full overflow-hidden bg-white border border-[#E8E2D2] p-0.5 shadow-xs shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/English_Cafe_Heritage_Emblem_544f6764.png"
              alt="English Cafe Heritage Logo"
              className="w-full h-full aspect-square object-contain"
            />
          </div>
          <span className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight text-[#1B3B2B] whitespace-nowrap shrink-0 group-hover:text-[#244D38] transition-colors">
            English Cafe
          </span>
        </button>

        {/* Zone 2: 4–5 single-line clean text nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A3B32]">
          <button
            onClick={() => setActiveTab('home')}
            className={`cursor-pointer transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'home'
                ? 'border-[#1B3B2B] text-[#1B3B2B] font-semibold'
                : 'border-transparent hover:text-[#1B3B2B]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`cursor-pointer transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'about'
                ? 'border-[#1B3B2B] text-[#1B3B2B] font-semibold'
                : 'border-transparent hover:text-[#1B3B2B]'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`cursor-pointer transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'menu'
                ? 'border-[#1B3B2B] text-[#1B3B2B] font-semibold'
                : 'border-transparent hover:text-[#1B3B2B]'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`cursor-pointer transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'gallery'
                ? 'border-[#1B3B2B] text-[#1B3B2B] font-semibold'
                : 'border-transparent hover:text-[#1B3B2B]'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`cursor-pointer transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 ${
              activeTab === 'contact'
                ? 'border-[#1B3B2B] text-[#1B3B2B] font-semibold'
                : 'border-transparent hover:text-[#1B3B2B]'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors pb-1 border-b-2 whitespace-nowrap shrink-0 text-xs uppercase tracking-wider ${
              activeTab === 'lookup'
                ? 'border-[#1B3B2B] text-[#1B3B2B] font-semibold'
                : 'border-transparent text-[#7A6A5E] hover:text-[#1B3B2B]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Booking</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA Button + Admin Gateway */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('admin')}
            title="Administrator Portal"
            className={`p-2 rounded-lg border transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]'
                : 'bg-[#F7F4EB] text-[#4A3B32] border-[#E8E2D2] hover:bg-[#EFEAE0]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdminLoggedIn ? 'Dashboard' : 'Admin'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-sm font-medium tracking-wide rounded-md shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Calendar className="w-4 h-4 text-[#D8C7A5]" />
            <span>Book a Table</span>
          </button>
        </div>
      </div>
    </header>
  );
};
