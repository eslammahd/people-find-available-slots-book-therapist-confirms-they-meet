import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">S</div>
            <div>
              <p className="font-semibold text-slate-800 leading-none">Dr. Saad</p>
              <p className="text-xs text-slate-500">Licensed Therapist</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/booking" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Book Session</Link>
            <Link href="/login" className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="inline-block bg-teal-100 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Online Therapy Sessions • Cairo, Egypt
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6 leading-tight">
          A safe space to heal &amp;<br/>grow — with Dr. Saad
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Book your therapy session in minutes. Choose a time that works for you, pay securely, and Dr. Saad will confirm your appointment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/booking"
            className="bg-teal-600 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 hover:shadow-teal-300"
          >
            Book a Session →
          </Link>
          <Link
            href="/login"
            className="bg-white text-slate-700 text-lg font-semibold px-8 py-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:text-teal-600 transition-all"
          >
            My Appointments
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: '1', icon: '📅', title: 'Pick a slot', desc: 'Browse Dr. Saad\'s available times and choose what fits your schedule.' },
            { step: '2', icon: '💳', title: 'Pay securely', desc: 'Complete payment via Vodafone Cash or Insta Pay — quick and safe.' },
            { step: '3', icon: '✅', title: 'Get confirmed', desc: 'Dr. Saad reviews and confirms your session. You\'ll receive confirmation instantly.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
              <div className="text-4xl mb-4">{icon}</div>
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">{step}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-slate-400 text-sm">
        © {new Date().getFullYear()} Dr. Saad Therapy. All rights reserved.
      </footer>
    </main>
  );
}
