'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  patient_name: string;
  patient_email: string;
  slot_date: string;
  slot_time: string;
  payment_method: string;
  transaction_ref: string;
  status: string;
  notes?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: '✅' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: '❌' }
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/my-bookings'); return; }
      setUser({ email: user.email!, id: user.id });
      fetch(`/api/bookings?patientId=${user.id}`)
        .then(r => r.json())
        .then(d => { setBookings(d.bookings || []); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [router]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
          {user && <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>}
        </div>
        <button onClick={handleSignOut} className="text-sm text-slate-500 hover:text-red-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">Sign Out</button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-slate-500 mb-4">You have no bookings yet.</p>
          <a href="/" className="inline-block bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors">Book a Session</a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const st = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-800">{formatDate(b.slot_date)}</div>
                    <div className="text-sm text-slate-500">{b.slot_time}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.icon} {st.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">Payment: </span><span className="font-medium">{b.payment_method === 'vodafone_cash' ? 'Vodafone Cash' : 'Insta Pay'}</span></div>
                  <div><span className="text-slate-400">Ref: </span><span className="font-mono text-xs">{b.transaction_ref}</span></div>
                </div>
                {b.status === 'confirmed' && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                    ✅ Your session is confirmed! Dr. Saad will see you then.
                  </div>
                )}
                {b.status === 'rejected' && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    ❌ This booking was not confirmed. Please book a new slot.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
