'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

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

function groupByDate(slots: Slot[]) {
  const g: Record<string, Slot[]> = {};
  for (const s of slots) {
    if (!g[s.date]) g[s.date] = [];
    g[s.date].push(s);
  }
  return g;
}

export default function HomePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Slot | null>(null);

  useEffect(() => {
    fetch('/api/slots')
      .then(r => r.json())
      .then(d => { setSlots(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const grouped = groupByDate(slots);
  const dates = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-lg">DS</div>
          <div>
            <h1 className="text-xl font-bold text-teal-800">Dr. Saad — Therapy Sessions</h1>
            <p className="text-sm text-gray-500">Licensed Therapist · Online &amp; In-Person</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-teal-800 mb-3">Book Your Therapy Session</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">Choose an available time slot, fill in your details, and pay securely using Vodafone Cash or Insta Pay. Dr. Saad will confirm your session shortly.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            ['1', 'Pick a slot', 'Choose from available times'],
            ['2', 'Your details', 'Name, email & phone'],
            ['3', 'Pay online', 'Vodafone Cash or Insta Pay'],
            ['4', 'Confirmation', 'Dr. Saad confirms your session'],
          ].map(([n, title, desc]) => (
            <div key={n} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm w-52">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0">{n}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-6">Available Slots</h3>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Loading available slots...</p>
          </div>
        ) : dates.length === 0 ? (
          <p className="text-center py-20 text-gray-500">No available slots right now. Please check back soon.</p>
        ) : (
          <div className="space-y-8">
            {dates.map(date => (
              <div key={date}>
                <h4 className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-3">{formatDate(date)}</h4>
                <div className="flex flex-wrap gap-3">
                  {grouped[date].map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelected(slot)}
                      className={`px-5 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                        selected?.id === slot.id
                          ? 'bg-teal-700 border-teal-700 text-white shadow-md scale-105'
                          : 'bg-white border-teal-200 text-teal-800 hover:border-teal-500 hover:shadow'
                      }`}
                    >
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-10 text-center">
            <div className="inline-block bg-teal-50 border border-teal-200 rounded-xl px-6 py-4 mb-5">
              <p className="text-sm text-gray-500">Selected:</p>
              <p className="font-bold text-teal-800 text-lg">{formatDate(selected.date)}</p>
              <p className="text-teal-700">{formatTime(selected.start_time)} – {formatTime(selected.end_time)}</p>
            </div>
            <br />
            <Link
              href={`/book?slot=${selected.id}&date=${selected.date}&start=${selected.start_time}&end=${selected.end_time}`}
              className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-colors text-lg"
            >
              Book This Slot →
            </Link>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 text-center text-sm text-gray-400 border-t">
        <p>© {new Date().getFullYear()} Dr. Saad Therapy. All rights reserved.</p>
      </footer>
    </div>
  );
}
