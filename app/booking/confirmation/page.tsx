'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmationContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Patient';
  const id = params.get('id') || '';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-100 shadow-xl p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Booking Received!</h1>
        <p className="text-slate-500 mb-6">
          Thank you, <strong className="text-slate-700">{name}</strong>. Your booking request has been submitted successfully.
          Dr. Saad will review your payment and confirm your session.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">What happens next</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">→</span> Dr. Saad reviews your payment reference</li>
            <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">→</span> Your session is confirmed within 24 hours</li>
            <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">→</span> You can check your booking status by signing in</li>
          </ul>
        </div>
        {id && (
          <p className="text-xs text-slate-400 mb-6">Reference ID: <span className="font-mono text-slate-600">{id.slice(0, 8).toUpperCase()}</span></p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/booking" className="flex-1 border border-teal-200 text-teal-700 font-medium py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm">
            Book another session
          </Link>
          <Link href="/login" className="flex-1 bg-teal-600 text-white font-medium py-2.5 rounded-xl hover:bg-teal-700 transition-colors text-sm">
            Sign in to my account
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-400">Loading...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
