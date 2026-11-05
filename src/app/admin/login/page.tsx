'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AzLabsLogo } from '@/components/brand/logo';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sb = getBrowserClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    setLoading(true);
    setError(null);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError('Incorrect email or password.');
    router.replace('/admin');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="surface w-full max-w-sm space-y-5 p-8">
        <AzLabsLogo asLink={false} />
        <h1 className="font-display text-xl font-semibold text-zinc-50">Admin sign in</h1>
        {!sb ? (
          <p className="text-sm text-amber-300">Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs text-zinc-300">Email</label>
              <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs text-zinc-300">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
            </div>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
