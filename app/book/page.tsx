'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${dh}:${m} ${ampm}`;
}

const PAYMENT_INFO = {
  vodafone_cash: {
    label: 'Vodafone Cash',
    number: '01X-XXX-XXXX',
    instructions: 'Send the session fee to this Vodafone Cash number, then enter your transaction reference below.',
  },
  insta_pay: {
    label: 'Insta Pay',
    number: '@drsaadtherapy',
    instructions: 'Pay via Insta Pay using the handle above, then enter your transaction reference below.',
  },
};

function BookForm() {
  const params = useSearchParams();
  const router = useRouter();
  const slotId = params.get('slot') ?? '';
  const date = params.get('date') ?? '';
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    payment_method: 'vodafone_cash' as 'vodafone_cash' | 'insta_pay',
    reference: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const payInfo = PAYMENT_INFO[form.payment_method];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.reference.trim()) {
      setError('Please fill in all required fields including the payment reference.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: slotId,
          patient_name: form.name,
          patient_email: form.email,
          patient_phone: form.phone,
          payment_method: form.payment_method,
          payment_reference: form.reference,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Booking failed. Please try again.');
        setSubmitting(false);
        return;
      }
      router.push(
        `/confirmation?name=${encodeURIComponent(form.name)}&date=${encodeURIComponent(date)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&payment=${form.payment_method}&ref=${encodeURIComponent(form.reference)}`
      );
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <a href="/" className="text-teal-700 hover:underline text-sm">← Back to slots</a>
          <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-sm ml-2">DS</div>
          <h1 className="text-lg font-bold text-teal-800">Complete Your Booking</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-teal-700 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <p className="text-teal-200 text-sm mb-1">Your selected session</p>
          <p className="text-xl font-bold">{date ? formatDate(date) : 'Selected date'}</p>
          <p className="text-teal-100 text-lg">{start ? formatTime(start) : ''} – {end ? formatTime(end) : ''}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">Your Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ahmed Mohamed" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ahmed@example.com" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01X-XXX-XXXX" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Anything Dr. Saad should know before your session..." rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {(['vodafone_cash', 'insta_pay'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, payment_method: method }))}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${
                    form.payment_method === method
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${ form.payment_method === method ? 'border-teal-600' : 'border-gray-400' }`}>
                      {form.payment_method === method && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                    </div>
                    <span className="font-semibold text-sm text-gray-800">{PAYMENT_INFO[method].label}</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-6">
                    {method === 'vodafone_cash' ? '🔴 Vodafone Cash' : '🏦 Insta Pay'}
                  </p>
                </button>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-semibold text-amber-800 text-sm mb-1">{payInfo.label} — Payment Details</p>
              <p className="text-amber-700 font-mono text-lg font-bold mb-2">{payInfo.number}</p>
              <p className="text-amber-700 text-sm">{payInfo.instructions}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference / Receipt Number *</label>
              <input
                type="text"
                value={form.reference}
                onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                placeholder="e.g. VF-12345678 or IP-987654"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
          >
            {submitting ? 'Submitting...' : 'Confirm Booking →'}
          </button>
          <p className="text-center text-xs text-gray-400">Dr. Saad will review and confirm your booking via email.</p>
        </form>
      </main>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <BookForm />
    </Suspense>
  );
}
