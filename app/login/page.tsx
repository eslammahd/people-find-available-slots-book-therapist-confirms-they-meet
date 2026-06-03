'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h1>
        <p className="text-slate-500 mb-6">Sign in to manage your bookings.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Your password" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">New patient? <a href="/signup" className="text-sky-600 font-medium hover:underline">Create account</a></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="py-16 text-center text-slate-400">Loading...</div>}><LoginForm /></Suspense>;
}
