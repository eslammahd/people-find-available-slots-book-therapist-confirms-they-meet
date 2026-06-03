import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from('slots').select('*').order('date').order('start_time');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data || [] });
}

export async function POST(req: NextRequest) {
  const { date, start_time, end_time } = await req.json();
  if (!date || !start_time || !end_time) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('slots')
    .insert({ date, start_time, end_time, is_available: true })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slot: data });
}

export async function DELETE(req: NextRequest) {
  const { slotId } = await req.json();
  const admin = createAdminClient();
  const { error } = await admin.from('slots').delete().eq('id', slotId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
