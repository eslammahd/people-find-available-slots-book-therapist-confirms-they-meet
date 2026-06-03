'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('error') === 'unauthorized';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(isUnauthorized ? 'You do not have admin access.' : '');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication failed');
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('You do not have admin access.');
      }
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">&#x1F510;</div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
          <p className="text-slate-500 text-sm mt-1">Dr. Saad&#x2019;s private dashboard access</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Your password" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <Suspense fallback={<div className="py-16 text-center text-slate-400">Loading...</div>}><AdminLoginForm /></Suspense>;
}
