import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = createAdminClient();
  
  // Create profiles table
  const { error: profilesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'patient',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  });

  return NextResponse.json({ ok: true, profilesError });
}
