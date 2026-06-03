import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('cookie') || '';
  const admin = createAdminClient();

  // We use service role to fetch all bookings - admin-only via middleware
  const { data, error } = await admin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data || [] });
}

export async function PATCH(req: NextRequest) {
  const { bookingId, status } = await req.json();
  if (!bookingId || !status) {
    return NextResponse.json({ error: 'Missing bookingId or status' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data });
}
