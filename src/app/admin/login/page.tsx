'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError('Supabase authentication is not configured.');
      setLoading(false);
      return;
    }
    const supabase = createBrowserClient(url, key);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Sign-in failed. Check your credentials or contact an administrator.');
      setLoading(false);
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">AZ Labs</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Admin sign in</h1>
          <p className="mt-2 text-sm text-zinc-400">Authorised team members only.</p>
        </div>
        {error && <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
        <div className="space-y-2"><label className="text-sm text-zinc-300">Email</label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><label className="text-sm text-zinc-300">Password</label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500">{loading ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </main>
  );
}
