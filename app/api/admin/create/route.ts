import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// Secret endpoint to create admin account — secured by a secret token
export async function POST(req: NextRequest) {
  const { email, password, fullName, secret } = await req.json();

  if (secret !== process.env.ADMIN_CREATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'admin' }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    await admin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: 'admin'
    });
  }

  return NextResponse.json({ user: data.user });
}
