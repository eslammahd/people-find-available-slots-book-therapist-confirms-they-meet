'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function AdminSlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchSlots = useCallback(async () => {
    const res = await fetch('/api/admin/slots');
    if (res.status === 403) { router.push('/admin/login'); return; }
    const data = await res.json();
    setSlots(data.slots || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return; }
      fetchSlots();
    });
  }, [router, fetchSlots]);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    const res = await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, start_time: startTime, end_time: endTime })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to add slot'); }
    else { await fetchSlots(); setDate(''); }
    setAdding(false);
  };

  const deleteSlot = async (slotId: string) => {
    await fetch('/api/admin/slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId })
    });
    await fetchSlots();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <a href="/admin" className="text-sm text-slate-500 hover:text-slate-700">← Dashboard</a>
        <h1 className="text-2xl font-bold text-slate-800">Manage Slots</h1>
      </div>

      {/* Add slot form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4">Add New Slot</h2>
        <form onSubmit={addSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none text-sm" />
          </div>
          {error && <p className="sm:col-span-4 text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={adding} className="sm:col-span-4 bg-brand-600 text-white py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm">
            {adding ? 'Adding…' : '+ Add Slot'}
          </button>
        </form>
      </div>

      {/* Slots list */}
      {loading ? (
        <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No slots yet. Add one above.</div>
      ) : (
        <div className="space-y-3">
          {slots.map(slot => (
            <div key={slot.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-700">{formatDate(slot.date)}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-600 text-sm">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${slot.is_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                  {slot.is_available ? 'Available' : 'Booked'}
                </span>
                <button onClick={() => deleteSlot(slot.id)} className="text-sm text-red-400 hover:text-red-600 transition-colors">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
