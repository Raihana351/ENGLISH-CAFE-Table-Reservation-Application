import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Mail, Phone, User, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Search } from 'lucide-react';
import type { Booking, TimeSlotAvailability } from '../types';

interface ReservationFormProps {
  onBookingSuccess?: (booking: Booking) => void;
  initialMode?: 'book' | 'lookup';
}

export const ReservationForm: React.FC<ReservationFormProps> = ({ onBookingSuccess, initialMode = 'book' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'book' | 'lookup'>(initialMode);

  // Booking Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Availability State
  const [slots, setSlots] = useState<TimeSlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string>('');

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Lookup State
  const [lookupId, setLookupId] = useState<string>('');
  const [lookupEmail, setLookupEmail] = useState<string>('');
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupResult, setLookupResult] = useState<Booking | null>(null);
  const [lookupError, setLookupError] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string>('');

  // Fetch Available Slots whenever date or guestCount changes
  useEffect(() => {
    let isCancelled = false;
    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotError('');
      try {
        const resp = await fetch(`/api/availability?date=${bookingDate}&guests=${guestCount}`);
        const data = await resp.json();
        if (isCancelled) return;

        if (data.success && Array.isArray(data.slots)) {
          setSlots(data.slots);
          // If previously selected time is no longer available, clear it
          const stillValid = data.slots.some((s: TimeSlotAvailability) => s.time === selectedTime && s.available);
          if (!stillValid) {
            // Auto-select first available slot if any
            const firstAvail = data.slots.find((s: TimeSlotAvailability) => s.available);
            setSelectedTime(firstAvail ? firstAvail.time : '');
          }
        } else {
          setSlotError(data.error || 'Unable to retrieve availability.');
          setSlots([]);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          setSlotError('Error connecting to reservation system: ' + msg);
        }
      } finally {
        if (!isCancelled) setLoadingSlots(false);
      }
    }

    if (bookingDate) {
      fetchSlots();
    }

    return () => {
      isCancelled = true;
    };
  }, [bookingDate, guestCount]);

  // Handle Booking Submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedTime) {
      setSubmitError('Please select a dining time slot.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setSubmitError('Please complete all contact details.');
      return;
    }

    setSubmitting(true);
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const resp = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          customerName,
          customerEmail,
          customerPhone,
          bookingDate,
          startTime: selectedTime,
          guestCount,
          specialRequests
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success && data.booking) {
        setConfirmedBooking(data.booking);
        if (onBookingSuccess) onBookingSuccess(data.booking);
      } else {
        setSubmitError(data.error || 'Reservation could not be completed. The selected table may have just been booked.');
        // Refresh slots
        const reloadResp = await fetch(`/api/availability?date=${bookingDate}&guests=${guestCount}`);
        const reloadData = await reloadResp.json();
        if (reloadData.success) setSlots(reloadData.slots);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(`Network error while submitting: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Customer Lookup
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);
    setCancelSuccessMsg('');

    if (!lookupId.trim() || !lookupEmail.trim()) {
      setLookupError('Please enter both your Booking Reference and Email Address.');
      return;
    }

    setLookupLoading(true);
    try {
      const resp = await fetch(`/api/bookings/lookup?bookingId=${encodeURIComponent(lookupId.trim())}&email=${encodeURIComponent(lookupEmail.trim())}`);
      const data = await resp.json();
      if (resp.ok && data.success && data.booking) {
        setLookupResult(data.booking);
      } else {
        setLookupError(data.error || 'No booking found matching those details.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLookupError(`Lookup failed: ${msg}`);
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle Customer Cancellation
  const handleCancelReservation = async () => {
    if (!lookupResult) return;
    if (!confirm('Are you certain you wish to cancel this table reservation?')) return;

    setCancelling(true);
    try {
      const resp = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: lookupResult.bookingId,
          customerEmail: lookupResult.customerEmail,
          reason: 'Cancelled via customer portal'
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setLookupResult(data.booking);
        setCancelSuccessMsg('Your reservation has been cancelled and the table released.');
      } else {
        setLookupError(data.error || 'Cancellation could not be processed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLookupError('Error cancelling booking: ' + msg);
    } finally {
      setCancelling(false);
    }
  };

  // If already confirmed, render the Confirmation Card
  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-[#FDFBF7] border-2 border-[#1B3B2B] rounded-lg shadow-md text-left">
        <div className="flex items-center gap-4 text-[#1B3B2B] mb-5">
          <div className="w-16 h-16 aspect-square rounded-lg bg-white border border-[#E8E2D2] p-1 shadow-xs shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/English_Cafe_Heritage_Emblem_544f6764.png"
              alt="English Cafe Logo"
              className="w-full h-full aspect-square object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-editorial text-2xl font-bold text-[#1B3B2B]">Reservation Confirmed</h2>
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <p className="text-xs text-[#7A6A5E] uppercase tracking-wider mt-0.5">English Cafe Mayfair · Table Reserved</p>
          </div>
        </div>

        <p className="text-sm text-[#4A3B32] mb-6 leading-relaxed">
          Dear <span className="font-semibold">{confirmedBooking.customerName}</span>, your table has been allocated and secured. A confirmation email has been dispatched to <span className="font-medium text-[#1B3B2B]">{confirmedBooking.customerEmail}</span>.
        </p>

        <div className="bg-[#F7F4EB] p-5 rounded-md border border-[#E8E2D2] mb-6 space-y-3">
          <div className="flex justify-between items-center text-sm py-1 border-b border-[#E8E2D2]">
            <span className="text-[#7A6A5E]">Booking Reference:</span>
            <span className="font-mono font-bold text-[#1B3B2B] text-base">{confirmedBooking.bookingId}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-1 border-b border-[#E8E2D2]">
            <span className="text-[#7A6A5E]">Date:</span>
            <span className="font-semibold text-[#2C221E]">{confirmedBooking.bookingDate}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-1 border-b border-[#E8E2D2]">
            <span className="text-[#7A6A5E]">Time:</span>
            <span className="font-semibold text-[#2C221E]">{confirmedBooking.startTime} – {confirmedBooking.endTime}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-1 border-b border-[#E8E2D2]">
            <span className="text-[#7A6A5E]">Party Size:</span>
            <span className="font-semibold text-[#2C221E]">{confirmedBooking.guestCount} Guest{confirmedBooking.guestCount > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-1">
            <span className="text-[#7A6A5E]">Assigned Table:</span>
            <span className="font-medium text-[#1B3B2B] bg-white px-2.5 py-0.5 rounded border border-[#D8D2C2]">
              {confirmedBooking.assignedTableIds.join(', ')}
            </span>
          </div>
          {confirmedBooking.specialRequests && (
            <div className="pt-2 text-xs text-[#5A4B42] italic">
              Special Request: "{confirmedBooking.specialRequests}"
            </div>
          )}
        </div>

        <div className="text-xs text-[#7A6A5E] mb-6 bg-white p-3 rounded border border-[#E8E2D2]">
          <strong>Arrival Notice:</strong> Tables are held for 15 minutes past reservation time. If running late, please telephone +44 20 7946 0912.
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setConfirmedBooking(null);
              setSelectedTime('');
            }}
            className="px-5 py-2.5 bg-[#1B3B2B] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#152e22] transition-colors cursor-pointer"
          >
            Make Another Booking
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-white text-[#2C221E] border border-[#D8D2C2] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F7F4EB] transition-colors cursor-pointer"
          >
            Print Confirmation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Sub-tabs: Make Booking vs. Find Reservation */}
      <div className="flex items-center justify-center gap-2 mb-8 p-1 bg-[#F7F4EB] rounded-lg max-w-sm mx-auto border border-[#E8E2D2]">
        <button
          onClick={() => setActiveSubTab('book')}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'book'
              ? 'bg-[#1B3B2B] text-white shadow-xs'
              : 'text-[#5A4B42] hover:text-[#1B3B2B]'
          }`}
        >
          Book a Table
        </button>
        <button
          onClick={() => setActiveSubTab('lookup')}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'lookup'
              ? 'bg-[#1B3B2B] text-white shadow-xs'
              : 'text-[#5A4B42] hover:text-[#1B3B2B]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Find / Cancel</span>
        </button>
      </div>

      {activeSubTab === 'lookup' ? (
        /* LOOKUP EXISTING RESERVATION VIEW */
        <div className="bg-white border border-[#E8E2D2] rounded-lg p-6 sm:p-8 shadow-xs max-w-xl mx-auto text-left">
          <h2 className="font-editorial text-2xl font-bold text-[#1B3B2B] mb-2">Find Your Reservation</h2>
          <p className="text-xs text-[#7A6A5E] mb-6">Enter your reference code and booking email to view table details or cancel your reservation.</p>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#4A3B32] mb-1 uppercase tracking-wider">Booking Reference</label>
              <input
                type="text"
                placeholder="e.g. EC-20261108-1021"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A3B32] mb-1 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="The email provided during reservation"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
              />
            </div>

            {lookupError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {cancelSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cancelSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={lookupLoading}
              className="w-full py-3 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {lookupLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Lookup Reservation</span>
            </button>
          </form>

          {/* Lookup Result Box */}
          {lookupResult && (
            <div className="mt-8 pt-6 border-t border-[#E8E2D2]">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-base text-[#1B3B2B]">{lookupResult.bookingId}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  lookupResult.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                  lookupResult.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-stone-100 text-stone-800'
                }`}>
                  {lookupResult.bookingStatus}
                </span>
              </div>

              <div className="bg-[#F7F4EB] p-4 rounded text-sm space-y-2 mb-4">
                <div><strong>Guest:</strong> {lookupResult.customerName} ({lookupResult.guestCount} guests)</div>
                <div><strong>Date & Time:</strong> {lookupResult.bookingDate} at {lookupResult.startTime} – {lookupResult.endTime}</div>
                <div><strong>Assigned Table:</strong> {lookupResult.assignedTableIds.join(', ')}</div>
                {lookupResult.specialRequests && <div><strong>Requests:</strong> {lookupResult.specialRequests}</div>}
              </div>

              {lookupResult.bookingStatus === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={handleCancelReservation}
                  disabled={cancelling}
                  className="w-full py-2.5 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {cancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Cancel This Reservation</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD NEW RESERVATION FLOW */
        <div className="bg-white border border-[#E8E2D2] rounded-lg shadow-sm overflow-hidden text-left">
          <div className="bg-[#1B3B2B] px-6 py-6 text-white">
            <h2 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight">Table Reservation</h2>
            <p className="text-white/80 text-xs sm:text-sm mt-1">Live table allocation powered by Google Sheets backend & concurrency locking.</p>
          </div>

          <form onSubmit={handleSubmitBooking} className="p-6 sm:p-8 space-y-8">
            
            {/* Step 1: Party Size & Date */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center text-xs">1</span>
                <span>Select Date & Party Size</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#7A6A5E]" />
                    <span>Reservation Date</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                    required
                  />
                  <div className="text-[11px] text-[#7A6A5E] mt-1">Accepting reservations up to 60 days in advance.</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#7A6A5E]" />
                    <span>Number of Guests</span>
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'} {num >= 7 ? '(Combined Table Setup)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-[#7A6A5E] mt-1">Parties of 7+ will be assigned combinable banquette tables.</div>
                </div>
              </div>
            </div>

            {/* Step 2: Live Available Time Slots */}
            <div className="pt-6 border-t border-[#E8E2D2]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center text-xs">2</span>
                  <span>Select Arrival Time</span>
                </div>
                {loadingSlots && (
                  <div className="flex items-center gap-1.5 text-xs text-[#7A6A5E]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking live table availability...</span>
                  </div>
                )}
              </div>

              {slotError ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded">
                  {slotError}
                </div>
              ) : slots.length === 0 && !loadingSlots ? (
                <div className="p-4 bg-[#F7F4EB] text-center text-xs text-[#7A6A5E] rounded">
                  No slots available for this date. The cafe may be closed or fully booked.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedTime(s.time)}
                      className={`py-2.5 px-2 text-center rounded border text-xs font-medium transition-all cursor-pointer ${
                        selectedTime === s.time
                          ? 'bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-xs'
                          : s.available
                          ? 'bg-[#FDFBF7] hover:bg-[#F7F4EB] text-[#2C221E] border-[#D8D2C2]'
                          : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="font-semibold">{s.time}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">
                        {s.available ? `${s.remainingTables} left` : 'Fully Booked'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedTime && (
                <div className="mt-3 text-xs text-[#1B3B2B] font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Selected Dining Slot: {selectedTime} (60 min duration + 15 min buffer)</span>
                </div>
              )}
            </div>

            {/* Step 3: Contact & Special Requests */}
            <div className="pt-6 border-t border-[#E8E2D2]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1B3B2B] mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center text-xs">3</span>
                <span>Guest Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lady Eleanor Vance"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3B32] mb-1">Telephone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 20 7946 0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3B32] mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Dietary requirements (vegetarian, gluten-free), anniversary, birthday, high-chair, or quiet corner table preference..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FDFBF7] border border-[#D8D2C2] rounded text-sm text-[#2C221E] focus:outline-none focus:border-[#1B3B2B]"
                />
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !selectedTime}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1B3B2B] hover:bg-[#152e22] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                    <span>Allocating Table & Locking Reservation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Book Reservation</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};
