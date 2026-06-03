import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET() {
  const admin = createAdminClient();

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await admin
    .from('slots')
    .select('*')
    .eq('is_available', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json({ slots: generateDemoSlots(), demo: true });
  }

  return NextResponse.json({ slots: data, demo: false });
}

function generateDemoSlots() {
  const slots = [];
  const times = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' }
  ];
  let id = 1;
  for (let d = 1; d <= 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const day = date.getDay();
    if (day === 5 || day === 6) continue;
    const dateStr = date.toISOString().split('T')[0];
    for (const t of times) {
      slots.push({ id: `demo-${id++}`, date: dateStr, start_time: t.start, end_time: t.end, is_available: true });
    }
  }
  return slots;
}
