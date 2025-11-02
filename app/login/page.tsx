'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const sendMagicLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800/90 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">Use your email to receive a magic link</p>
        </div>
        {sent ? (
          <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-4 text-emerald-200">
            Check your inbox for the sign-in link.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <button
              onClick={sendMagicLink}
              disabled={loading || !email}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </div>
        )}
        <div className="mt-6 text-center text-sm text-slate-400">
          <Link href="/" className="text-blue-400 hover:underline">Back to home</Link>
        </div>
      </div>
    </div>
  );
}


