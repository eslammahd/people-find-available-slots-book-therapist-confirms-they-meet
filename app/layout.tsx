import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dr. Saad Therapy — Book Your Session',
  description: 'Book a therapy session with Dr. Saad. View available slots and pay securely online.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
