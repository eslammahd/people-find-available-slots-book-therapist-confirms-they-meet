import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET() {
  const admin = createAdminClient();
  
  const { data, error } = await admin
    .from('slots')
    .select('*')
    .eq('is_available', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    // Return demo slots if DB not set up
    const demoSlots = generateDemoSlots();
    return NextResponse.json({ slots: demoSlots, demo: true });
  }

  if (!data || data.length === 0) {
    const demoSlots = generateDemoSlots();
    return NextResponse.json({ slots: demoSlots, demo: true });
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
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let slotId = 1;
  for (let d = 1; d <= 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) continue; // skip Fri/Sat
    const dateStr = date.toISOString().split('T')[0];
    for (const t of times) {
      slots.push({
        id: `demo-${slotId++}`,
        date: dateStr,
        start_time: t.start,
        end_time: t.end,
        is_available: true,
        day_name: dayNames[dayOfWeek]
      });
    }
  }
  return slots;
}
