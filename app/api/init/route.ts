import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST() {
  const admin = createAdminClient();

  // Check if slots table exists by querying it
  const { error: slotsCheck } = await admin.from('slots').select('id').limit(1);
  
  if (slotsCheck) {
    // Table doesn't exist or error - return info
    return NextResponse.json({ 
      message: 'Database not yet initialized via migration. Please run migrations.',
      error: slotsCheck.message 
    }, { status: 200 });
  }

  return NextResponse.json({ message: 'Database ready' });
}
