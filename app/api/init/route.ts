import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST() {
  const admin = createAdminClient();
  const { error: slotsCheck } = await admin.from('slots').select('id').limit(1);
  if (slotsCheck) {
    return NextResponse.json({ message: 'Database not yet initialized', error: slotsCheck.message }, { status: 200 });
  }
  return NextResponse.json({ message: 'Database ready' });
}
