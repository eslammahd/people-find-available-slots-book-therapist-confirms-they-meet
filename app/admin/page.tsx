'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  slot_date: string;
  slot_time: string;
  payment_method: string;
  transaction_ref: string;
  status: 'pending' | 'confirmed' | 'rejected';
  notes?: string;
  created_at: string;
}

type TabType = 'pending' | 'confirmed' | 'all';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [updating, setUpdating] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');

  const fetchBookings = useCallback(async () => {
    const res = await fetch('/api/admin/bookings');
    if (res.status === 401 || res.status === 403) { router.push('/admin/login'); return; }
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return; }
      setAdminEmail(user.email || '');
      fetchBookings();
    });
  }, [router, fetchBookings]);

  const updateBooking = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    setUpdating(bookingId);
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status })
    });
    await fetchBookings();
    setUpdating(null);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const filtered = bookings.filter(b => activeTab === 'all' ? true : b.status === activeTab);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const tabs: TabType[] = ['pending', 'confirmed', 'all'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{adminEmail}</p>
        </div>
        <div className="flex gap-3">
          <a href="/admin/slots" className="text-sm border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Manage Slots</a>
          <button onClick={handleSignOut} className="text-sm text-slate-500 hover:text-red-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">Sign Out</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><div className="text-3xl font-bold text-amber-600">{pendingCount}</div><div className="text-sm text-slate-500 mt-1">Pending</div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><div className="text-3xl font-bold text-green-600">{confirmedCount}</div><div className="text-sm text-slate-500 mt-1">Confirmed</div></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><div className="text-3xl font-bold text-slate-700">{bookings.length}</div><div className="text-sm text-slate-500 mt-1">Total</div></div>
      </div>
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={'px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ' + (activeTab === tab ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}>
            {tab}{tab === 'pending' && pendingCount > 0 ? ' (' + pendingCount + ')' : ''}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-16"><div className="inline-block w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">No {activeTab} bookings.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-800 text-lg">{b.patient_name}</div>
                  <div className="text-sm text-slate-500">{b.patient_email}{b.patient_phone ? ' - ' + b.patient_phone : ''}</div>
                </div>
                <span className={'px-3 py-1 rounded-full text-xs font-semibold capitalize ' + (STATUS_BADGE[b.status] || '')}>{b.status}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                <div><span className="text-slate-400 block text-xs">Date</span><span className="font-medium">{formatDate(b.slot_date)}</span></div>
                <div><span className="text-slate-400 block text-xs">Time</span><span className="font-medium">{b.slot_time}</span></div>
                <div><span className="text-slate-400 block text-xs">Payment</span><span className="font-medium">{b.payment_method === 'vodafone_cash' ? 'Vodafone Cash' : 'Insta Pay'}</span></div>
                <div><span className="text-slate-400 block text-xs">Ref</span><span className="font-mono text-xs">{b.transaction_ref}</span></div>
              </div>
              {b.notes && <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3 mb-3">Note: {b.notes}</p>}
              {b.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => updateBooking(b.id, 'confirmed')} disabled={updating === b.id}
                    className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                    {updating === b.id ? 'Updating...' : 'Confirm Session'}
                  </button>
                  <button onClick={() => updateBooking(b.id, 'rejected')} disabled={updating === b.id}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
