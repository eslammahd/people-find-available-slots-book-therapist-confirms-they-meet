'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function formatTime(t: string) {
  try {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${dh}:${m} ${ampm}`;
  } catch { return t; }
}

function ConfirmationContent() {
  const params = useSearchParams();
  const name = params.get('name') ?? 'Patient';
  const date = params.get('date') ?? '';
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';
  const payment = params.get('payment') ?? '';
  const ref = params.get('ref') ?? '';
  const paymentLabel = payment === 'vodafone_cash' ? 'Vodafone Cash' : payment === 'insta_pay' ? 'Insta Pay' : payment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-teal-800 mb-2">Booking Submitted!</h1>
          <p className="text-gray-500 mb-6">
            Thank you, <strong>{name}</strong>. Your booking request has been received. Dr. Saad will review and confirm your session soon.
          </p>

          <div className="bg-teal-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <h2 className="font-semibold text-teal-800 text-sm uppercase tracking-wide">Booking Details</h2>
            {date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800">{formatDate(date)}</span>
              </div>
            )}
            {start && end && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-800">{formatTime(start)} – {formatTime(end)}</span>
              </div>
            )}
            {paymentLabel && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment via</span>
                <span className="font-medium text-gray-800">{paymentLabel}</span>
              </div>
            )}
            {ref && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reference</span>
                <span className="font-medium text-gray-800 font-mono">{ref}</span>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <p className="font-semibold text-amber-800 text-sm mb-2">What happens next?</p>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>✓ Dr. Saad will review your booking and payment reference</li>
              <li>✓ You will receive confirmation once approved</li>
              <li>✓ If there is an issue, Dr. Saad will contact you directly</li>
            </ul>
          </div>

          <Link href="/" className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
            Back to Home
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">© {new Date().getFullYear()} Dr. Saad Therapy</p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
