'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function NavBar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setLoading(false);
    });
    return () => {
      sub.subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="border-b border-slate-800/60 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Madomi Personal Space</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/rooms" className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
              Rooms
            </Link>
            {loading ? null : userEmail ? (
              <>
                <span className="hidden text-xs text-slate-400 sm:inline">{userEmail}</span>
                <button onClick={signOut} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700">Sign out</button>
              </>
            ) : (
              <Link href="/login" className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


