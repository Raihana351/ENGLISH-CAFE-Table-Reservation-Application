import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { CAFE_INFO } from '../constants/cafeData';

export const ContactSection: React.FC = () => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMessage) return;
    setSent(true);
    setTimeout(() => {
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMessage('');
    }, 1000);
  };

  return (
    <section className="py-16 lg:py-24 bg-[#F7F4EB] border-b border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-[#7A6A5E] font-medium mb-2">
            Location & Hours
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1B3B2B] tracking-tight">
            Find Us in Mayfair
          </h2>
          <p className="text-sm sm:text-base text-[#5A4B42] mt-3">
            Located on Royal Crescent, moments from Green Park and Piccadilly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          
          {/* Left Column: Cafe Information */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-white p-6 rounded-lg border border-[#E8E2D2]">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#1B3B2B] shrink-0 mt-1" />
                <div>
                  <h3 className="font-editorial text-lg font-semibold text-[#1B3B2B] mb-1">Address & Arrival</h3>
                  <p className="text-sm text-[#4A3B32]">{CAFE_INFO.address}</p>
                  <p className="text-xs text-[#7A6A5E] mt-1.5">{CAFE_INFO.transitNotes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E8E2D2]">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#1B3B2B] shrink-0 mt-1" />
                <div className="w-full">
                  <h3 className="font-editorial text-lg font-semibold text-[#1B3B2B] mb-2">Service Hours</h3>
                  <div className="space-y-1.5 text-xs text-[#4A3B32]">
                    {CAFE_INFO.openingHours.map(h => (
                      <div key={h.days} className="flex justify-between border-b border-[#F7F4EB] pb-1">
                        <span className="font-medium">{h.days}:</span>
                        <span className="font-mono tabular-nums">{h.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-[#E8E2D2]">
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#1B3B2B] shrink-0 mt-1" />
                <div>
                  <h3 className="font-editorial text-lg font-semibold text-[#1B3B2B] mb-1">Direct Telephones</h3>
                  <p className="text-sm text-[#4A3B32] font-mono tabular-nums">{CAFE_INFO.phone}</p>
                  <p className="text-xs text-[#7A6A5E] mt-1">General inquiries and event buyout requests.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiries Form */}
          <div className="lg:col-span-6 bg-white p-8 rounded-lg border border-[#E8E2D2] shadow-xs">
            <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B] mb-2">Private Dining & Inquiries</h3>
            <p className="text-xs text-[#7A6A5E] mb-6">
              For private dining room hire, high tea group buyouts, or press inquiries, please send us a message.
            </p>

            {sent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <h4 className="font-editorial text-lg font-semibold text-emerald-900">Message Received</h4>
                <p className="text-xs text-emerald-800 mt-1">Our Maitre D’ will respond to your inquiry within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Lord Harrington"
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="name@domain.co.uk"
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Tell us about your event date, expected guest count, or bespoke tea requirements..."
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
