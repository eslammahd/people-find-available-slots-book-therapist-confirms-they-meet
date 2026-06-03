'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
};

function getNextWeekdaySlots(): Slot[] {
  const slots: Slot[] = [];
  const times = [
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ];
  let added = 0;
  let dayOffset = 1;
  while (added < 10) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const dow = d.getDay(); // 0=Sun,5=Fri,6=Sat
    if (dow !== 5 && dow !== 6) {
      const dateStr = d.toISOString().split('T')[0];
      times.forEach((t, i) => {
        slots.push({ id: `${dateStr}-${i}`, date: dateStr, start_time: t.start, end_time: t.end });
      });
      added++;
    }
    dayOffset++;
  }
  return slots;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2,'0')} ${ampm}`;
}

export default function BookingPage() {
  const router = useRouter();
  const allSlots = getNextWeekdaySlots();

  // Group by date
  const byDate: Record<string, Slot[]> = {};
  allSlots.forEach(s => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });
  const dates = Object.keys(byDate).sort();

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<'pick' | 'details'>('pick');
  const [form, setForm] = useState({ name: '', email: '', phone: '', paymentMethod: 'vodafone_cash', paymentRef: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSelectSlot(slot: Slot) {
    setSelectedSlot(slot);
    setStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          slot_date: selectedSlot.date,
          slot_start: selectedSlot.start_time,
          slot_end: selectedSlot.end_time,
          patient_name: form.name,
          patient_email: form.email,
          patient_phone: form.phone,
          payment_method: form.paymentMethod,
          payment_reference: form.paymentRef,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      router.push(`/booking/confirmation?id=${data.id}&name=${encodeURIComponent(form.name)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">S</div>
            <div>
              <p className="font-semibold text-slate-800 leading-none">Dr. Saad</p>
              <p className="text-xs text-slate-500">Licensed Therapist</p>
            </div>
          </Link>
          <Link href="/login" className="text-sm text-slate-600 hover:text-teal-600">Sign In</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'pick' ? 'text-teal-700' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'pick' ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-600'}`}>1</span>
            Choose a slot
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 'details' ? 'text-teal-700' : 'text-slate-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'details' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            Your details &amp; payment
          </div>
        </div>

        {step === 'pick' && (
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Available Sessions</h1>
            <p className="text-slate-500 mb-8">Pick a time that works for you. Sessions are 60 minutes.</p>
            <div className="space-y-6">
              {dates.map(date => (
                <div key={date}>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{formatDate(date)}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {byDate[date].map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-center hover:border-teal-400 hover:bg-teal-50 hover:shadow-md transition-all group"
                      >
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-teal-700">
                          {formatTime(slot.start_time)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">— {formatTime(slot.end_time)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && selectedSlot && (
          <div className="max-w-2xl">
            {/* Selected slot summary */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-600 font-medium uppercase tracking-wide">Your session</p>
                <p className="font-semibold text-teal-800">
                  {formatDate(selectedSlot.date)} • {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
                </p>
              </div>
              <button onClick={() => setStep('pick')} className="text-sm text-teal-600 hover:text-teal-800 underline">Change</button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Your details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment method *</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'vodafone_cash', label: 'Vodafone Cash', icon: '📱', color: 'red', desc: 'Send to 010-XXXX-XXXX' },
                    { value: 'insta_pay', label: 'Insta Pay', icon: '⚡', color: 'blue', desc: 'Transfer via Insta Pay app' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        form.paymentMethod === opt.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.value}
                        checked={form.paymentMethod === opt.value}
                        onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                        className="sr-only"
                      />
                      <span className="text-2xl block mb-2">{opt.icon}</span>
                      <span className="font-semibold text-slate-800 text-sm block">{opt.label}</span>
                      <span className="text-xs text-slate-500">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.paymentMethod === 'vodafone_cash' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-red-700 mb-1">Vodafone Cash Payment</p>
                  <p className="text-red-600">Send the session fee to: <strong>010-1234-5678</strong></p>
                  <p className="text-red-600 mt-1">Then enter your transaction reference below.</p>
                </div>
              )}
              {form.paymentMethod === 'insta_pay' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-blue-700 mb-1">Insta Pay Transfer</p>
                  <p className="text-blue-600">Transfer the session fee to IPA: <strong>drsaad@instapay</strong></p>
                  <p className="text-blue-600 mt-1">Then enter your transaction reference below.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment reference / Transaction ID *</label>
                <input
                  required
                  value={form.paymentRef}
                  onChange={e => setForm(f => ({ ...f, paymentRef: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  placeholder="e.g. TXN123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                  placeholder="Anything you'd like Dr. Saad to know before the session..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-teal-100"
              >
                {loading ? 'Submitting...' : 'Submit Booking Request →'}
              </button>
              <p className="text-xs text-slate-400 text-center">Dr. Saad will review your payment and confirm your session within 24 hours.</p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
