/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ReservationForm } from './components/ReservationForm';
import { MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'menu' | 'gallery' | 'reservations' | 'contact' | 'admin' | 'lookup'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('ec_admin_token'));
  });

  // Scroll to top on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col font-sans selection:bg-[#1B3B2B] selection:text-white">
      {/* Universal Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onBookClick={() => setActiveTab('reservations')}
              onExploreMenu={() => setActiveTab('menu')}
            />
            {/* Quick Interactive Reservation Module on Home Page */}
            <div className="bg-[#F7F4EB] py-12 border-b border-[#E8E2D2]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
                <div className="text-xs uppercase tracking-widest text-[#7A6A5E] font-medium mb-1">
                  Direct Table Allocation
                </div>
                <h2 className="font-editorial text-3xl font-normal text-[#1B3B2B]">
                  Reserve Your Mayfair Table
                </h2>
              </div>
              <ReservationForm onBookingSuccess={() => setActiveTab('reservations')} />
            </div>

            <MenuSection onReserveClick={() => setActiveTab('reservations')} />
            <AboutSection onReserveClick={() => setActiveTab('reservations')} />
            <GallerySection />
            <ContactSection />
          </>
        )}

        {activeTab === 'about' && (
          <AboutSection onReserveClick={() => setActiveTab('reservations')} />
        )}

        {activeTab === 'menu' && (
          <MenuSection onReserveClick={() => setActiveTab('reservations')} />
        )}

        {activeTab === 'gallery' && (
          <GallerySection />
        )}

        {activeTab === 'reservations' && (
          <div className="py-12 bg-[#FDFBF7]">
            <ReservationForm initialMode="book" />
          </div>
        )}

        {activeTab === 'lookup' && (
          <div className="py-12 bg-[#FDFBF7]">
            <ReservationForm initialMode="lookup" />
          </div>
        )}

        {activeTab === 'contact' && (
          <ContactSection />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavClick={(tab) => setActiveTab(tab)} />
    </div>
  );
}
