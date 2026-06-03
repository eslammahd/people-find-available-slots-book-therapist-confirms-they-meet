import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json();

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'patient' }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Manually create profile in case trigger doesn't fire
  if (data.user) {
    await admin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: 'patient'
    });
  }

  return NextResponse.json({ user: data.user });
}
