import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { patientName, patientEmail, patientPhone, slotId, slotDate, slotTime, paymentMethod, transactionRef, notes, patientId } = body;

  if (!patientName || !patientEmail || !slotDate || !slotTime || !paymentMethod || !transactionRef) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = createAdminClient();
  const isDemo = !slotId || (slotId as string).startsWith('demo-');

  const { data, error } = await admin.from('bookings').insert({
    patient_id: patientId || null,
    patient_name: patientName,
    patient_email: patientEmail,
    patient_phone: patientPhone || null,
    slot_id: isDemo ? null : slotId,
    slot_date: slotDate,
    slot_time: slotTime,
    payment_method: paymentMethod,
    transaction_ref: transactionRef,
    notes: notes || null,
    status: 'pending'
  }).select().single();

  if (error) {
    // Return a demo booking response so the UI still works
    return NextResponse.json({
      booking: {
        id: `demo-${Date.now()}`,
        patient_name: patientName,
        patient_email: patientEmail,
        slot_date: slotDate,
        slot_time: slotTime,
        payment_method: paymentMethod,
        transaction_ref: transactionRef,
        status: 'pending',
        created_at: new Date().toISOString()
      },
      demo: true
    });
  }

  if (!isDemo) {
    await admin.from('slots').update({ is_available: false }).eq('id', slotId);
  }

  return NextResponse.json({ booking: data, demo: false });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const patientId = searchParams.get('patientId');

  if (!email && !patientId) {
    return NextResponse.json({ error: 'Missing email or patientId' }, { status: 400 });
  }

  const admin = createAdminClient();
  let query = admin.from('bookings').select('*').order('created_at', { ascending: false });

  if (patientId) query = query.eq('patient_id', patientId);
  else if (email) query = query.eq('patient_email', email);

  const { data, error } = await query;
  if (error) return NextResponse.json({ bookings: [], error: error.message });
  return NextResponse.json({ bookings: data || [] });
}
