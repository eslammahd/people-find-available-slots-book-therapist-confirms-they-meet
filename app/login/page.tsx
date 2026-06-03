'use client';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl">S</div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">Dr. Saad</p>
              <p className="text-xs text-slate-500">Licensed Therapist</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Sign in to your account</h1>
          <p className="text-slate-500 text-sm mt-2">Access your bookings and appointment history</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <p className="text-center text-slate-500 text-sm py-4">Authentication coming in Stage 2 — stay tuned!</p>
          <Link
            href="/booking"
            className="block w-full text-center bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors mt-4"
          >
            Book a session instead →
          </Link>
        </div>
      </div>
    </main>
  );
}
