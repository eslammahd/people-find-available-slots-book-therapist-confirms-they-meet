import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('is_booked', false)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json(getDemoSlots());
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(getDemoSlots());
  }
}

function getDemoSlots() {
  const slots = [];
  const today = new Date();
  let count = 0;
  let dayOffset = 1;
  const times: [string, string][] = [['10:00', '11:00'], ['12:00', '13:00'], ['15:00', '16:00']];

  while (count < 18 && dayOffset < 30) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const dow = d.getDay();
    if (dow !== 5 && dow !== 6) {
      for (const [start, end] of times) {
        slots.push({
          id: `demo-${dayOffset}-${start.replace(':', '')}`,
          date: d.toISOString().split('T')[0],
          start_time: start,
          end_time: end,
          is_booked: false,
        });
        count++;
      }
    }
    dayOffset++;
  }
  return slots;
}
