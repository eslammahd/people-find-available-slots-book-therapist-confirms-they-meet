import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patient_name,
      patient_email,
      patient_phone,
      payment_method,
      payment_reference,
      notes,
      slot_date,
      slot_start,
      slot_end,
    } = body;

    if (!patient_name || !patient_email || !patient_phone || !payment_method || !payment_reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // DB not yet configured — return a mock success for Stage 1
      return NextResponse.json({
        id: crypto.randomUUID(),
        status: 'pending',
        message: 'Booking received (demo mode)',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find or create slot
    let slotId: string | null = null;
    if (slot_date && slot_start) {
      const { data: existingSlot } = await supabase
        .from('slots')
        .select('id')
        .eq('date', slot_date)
        .eq('start_time', slot_start + ':00')
        .eq('is_available', true)
        .single();

      if (existingSlot) {
        slotId = existingSlot.id;
        await supabase.from('slots').update({ is_available: false }).eq('id', slotId);
      } else {
        const { data: newSlot } = await supabase
          .from('slots')
          .insert({ date: slot_date, start_time: slot_start + ':00', end_time: (slot_end || '') + ':00', is_available: false })
          .select('id')
          .single();
        slotId = newSlot?.id || null;
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        slot_id: slotId,
        patient_name,
        patient_email,
        patient_phone,
        payment_method,
        payment_reference,
        notes: notes || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ id: data.id, status: 'pending' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
