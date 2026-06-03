import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Saad Therapy - Book Your Session',
  description: 'Professional therapy sessions with Dr. Saad. Book online, pay instantly.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-lg">&#x1F9E0; Dr. Saad Therapy</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-slate-600 hover:text-sky-600 transition-colors">Book a Session</a>
              <a href="/my-bookings" className="text-sm text-slate-600 hover:text-sky-600 transition-colors">My Bookings</a>
              <a href="/login" className="text-sm bg-sky-600 text-white px-4 py-1.5 rounded-full hover:bg-sky-700 transition-colors">Sign In</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="mt-16 py-8 text-center text-sm text-slate-400 border-t border-slate-200">
          &copy; {new Date().getFullYear()} Dr. Saad Therapy. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
