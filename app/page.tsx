'use client';
import { useState, useEffect } from 'react';

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface GroupedSlots {
  [date: string]: Slot[];
}

type Step = 'slots' | 'form' | 'payment' | 'done';
type PaymentMethod = 'vodafone_cash' | 'insta_pay';

export default function HomePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<Step>('slots');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone_cash');
  const [txRef, setTxRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    fetch('/api/slots')
      .then(r => r.json())
      .then(d => { setSlots(d.slots || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const grouped: GroupedSlots = slots.reduce((acc: GroupedSlots, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    return hour + ':' + m + ' ' + (hour >= 12 ? 'PM' : 'AM');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: name,
          patientEmail: email,
          patientPhone: phone,
          slotId: selectedSlot.id,
          slotDate: selectedSlot.date,
          slotTime: selectedSlot.start_time + ' - ' + selectedSlot.end_time,
          paymentMethod,
          transactionRef: txRef,
          notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setBookingId(data.booking.id);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep('slots');
    setSelectedSlot(null);
    setName('');
    setEmail('');
    setPhone('');
    setTxRef('');
    setNotes('');
    setBookingId('');
    setError('');
  };

  if (step === 'done') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
          <div className="text-6xl mb-4">&#x2705;</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Booking Received!</h1>
          <p className="text-slate-500 mb-6">Thank you, <strong>{name}</strong>. Dr. Saad will review and confirm your session shortly.</p>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            {selectedSlot && (
              <>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span className="font-medium">{formatDate(selectedSlot.date)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Time</span><span className="font-medium">{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</span></div>
              </>
            )}
            <div className="flex justify-between text-sm"><span className="text-slate-500">Payment</span><span className="font-medium">{paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'Insta Pay'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Ref #</span><span className="font-medium font-mono">{txRef}</span></div>
            {bookingId && <div className="flex justify-between text-sm"><span className="text-slate-500">Booking ID</span><span className="font-mono text-xs">{bookingId.slice(0, 8).toUpperCase()}</span></div>}
          </div>
          <p className="text-xs text-slate-400 mb-6">Confirmation email will be sent to <strong>{email}</strong> once approved.</p>
          <button onClick={resetFlow} className="w-full bg-sky-600 text-white py-2.5 rounded-xl font-medium hover:bg-sky-700 transition-colors">Book Another Session</button>
        </div>
      </div>
    );
  }

  const steps = ['Choose Slot', 'Your Details', 'Payment'];
  const stepKeys: Step[] = ['slots', 'form', 'payment'];
  const stepIndex = stepKeys.indexOf(step);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Book a Therapy Session</h1>
        <p className="text-slate-500">Choose a slot with Dr. Saad and complete your booking in minutes.</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ' + (done ? 'bg-green-100 text-green-700' : active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400')}>
                {done ? '\u2713' : (i + 1) + '.'} {s}
              </div>
              {i < 2 && <span className="text-slate-300">&#x2192;</span>}
            </div>
          );
        })}
      </div>

      {step === 'slots' && (
        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500">Loading available slots...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-20 text-slate-400">No available slots right now. Check back soon.</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, daySlots]) => (
                <div key={date} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-700">{formatDate(date)}</h3>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {daySlots.map(slot => (
                      <button key={slot.id} onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                        className="border-2 border-slate-200 rounded-xl py-3 px-4 text-center hover:border-sky-500 hover:bg-sky-50 transition-all group">
                        <div className="font-semibold text-slate-700 group-hover:text-sky-700">{formatTime(slot.start_time)}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'form' && selectedSlot && (
        <div className="max-w-lg mx-auto">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">&#x1F4C5;</span>
            <div>
              <div className="font-semibold text-sky-800">{formatDate(selectedSlot.date)}</div>
              <div className="text-sm text-sky-600">{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</div>
            </div>
            <button onClick={() => setStep('slots')} className="ml-auto text-sm text-slate-400 hover:text-slate-600">&#x2715; Change</button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" placeholder="01xxxxxxxxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none" placeholder="Anything Dr. Saad should know beforehand..." />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={() => { if (!name || !email) { setError('Please fill in your name and email'); return; } setError(''); setStep('payment'); }}
                className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors">Continue to Payment &#x2192;</button>
            </div>
          </div>
        </div>
      )}

      {step === 'payment' && selectedSlot && (
        <div className="max-w-lg mx-auto">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">&#x1F4C5;</span>
            <div>
              <div className="font-semibold text-sky-800">{formatDate(selectedSlot.date)}</div>
              <div className="text-sm text-sky-600">{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)} &middot; {name}</div>
            </div>
          </div>
          <form onSubmit={handleBookingSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-slate-800">Complete Payment</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method *</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPaymentMethod('vodafone_cash')}
                  className={'border-2 rounded-xl p-4 text-center transition-all ' + (paymentMethod === 'vodafone_cash' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300')}>
                  <div className="text-2xl mb-1">&#x1F4F1;</div>
                  <div className="font-semibold text-sm text-slate-700">Vodafone Cash</div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('insta_pay')}
                  className={'border-2 rounded-xl p-4 text-center transition-all ' + (paymentMethod === 'insta_pay' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300')}>
                  <div className="text-2xl mb-1">&#x1F4B3;</div>
                  <div className="font-semibold text-sm text-slate-700">Insta Pay</div>
                </button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              {paymentMethod === 'vodafone_cash' ? (
                <>
                  <p className="font-semibold text-amber-800 mb-1">Vodafone Cash Instructions</p>
                  <p className="text-sm text-amber-700">Send the session fee to: <strong>010-XXXX-XXXX</strong></p>
                  <p className="text-sm text-amber-700">Use your name as the reference when sending.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-amber-800 mb-1">Insta Pay Instructions</p>
                  <p className="text-sm text-amber-700">Transfer to IPA: <strong>drsaad@instapay</strong></p>
                  <p className="text-sm text-amber-700">Include your name in the transfer note.</p>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Reference Number *</label>
              <input value={txRef} onChange={e => setTxRef(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-mono"
                placeholder="Enter your transaction ID" />
              <p className="text-xs text-slate-400 mt-1">Found in your payment app after the transfer.</p>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('form')} className="flex-1 border border-slate-300 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors">&#x2190; Back</button>
              <button type="submit" disabled={submitting || !txRef}
                className="flex-1 bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
