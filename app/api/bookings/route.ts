import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slot_id, patient_name, patient_email, patient_phone, payment_method, payment_reference, notes } = body;

  if (!slot_id || !patient_name || !patient_email || !patient_phone || !payment_method || !payment_reference) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Demo slot — skip DB
  if (String(slot_id).startsWith('demo-')) {
    return NextResponse.json({
      id: 'demo-booking-' + Date.now(),
      slot_id,
      patient_name,
      patient_email,
      status: 'pending',
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await supabase.from('slots').update({ is_booked: true }).eq('id', slot_id);

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ slot_id, patient_name, patient_email, patient_phone, payment_method, payment_reference, notes: notes ?? '', status: 'pending' }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
