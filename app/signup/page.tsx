'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setDone(true); setLoading(false); return; }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
          <div className="text-5xl mb-4">&#x2709;&#xFE0F;</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Account created!</h2>
          <p className="text-slate-500">You can now sign in with <strong>{email}</strong>.</p>
          <a href="/login" className="mt-6 inline-block bg-sky-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-sky-700 transition-colors">Go to login &#x2192;</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create your account</h1>
        <p className="text-slate-500 mb-6">Book therapy sessions with Dr. Saad.</p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="At least 6 characters" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-4">Already have an account? <a href="/login" className="text-sky-600 font-medium hover:underline">Sign in</a></p>
      </div>
    </div>
  );
}
