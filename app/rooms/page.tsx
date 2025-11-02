'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { RoomMode } from '@/types';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [mode, setMode] = useState<RoomMode>('youtube');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const createRoom = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.push('/login'); return; }
      const name = roomName.trim();
      if (!name) throw new Error('Room name is required');
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data, error } = await supabase.from('rooms').insert({
        name,
        mode,
        owner_id: userData.user.id,
        join_code: code,
      }).select('id');
      if (error) throw error;
      const id = data?.[0]?.id as string;
      if (!id) throw new Error('Failed to create room');
      router.push(`/room/${id}`);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const doJoin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.push('/login'); return; }
      const code = joinCode.trim().toUpperCase();
      if (!code) throw new Error('Enter a code');
      const { data, error } = await supabase.from('rooms').select('id').eq('join_code', code).limit(1);
      if (error) throw error;
      const id = data?.[0]?.id as string;
      if (!id) throw new Error('Room not found');
      router.push(`/room/${id}`);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to join');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Your Rooms</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
          <h2 className="mb-3 font-semibold text-white">Create a Room</h2>
          <div className="space-y-3">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('youtube')}
                className={`rounded-lg border px-3 py-2 text-sm ${mode === 'youtube' ? 'border-blue-500 bg-blue-600/20 text-blue-200' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
              >YouTube</button>
              <button
                type="button"
                onClick={() => setMode('spotify')}
                className={`rounded-lg border px-3 py-2 text-sm ${mode === 'spotify' ? 'border-emerald-500 bg-emerald-600/20 text-emerald-200' : 'border-slate-600 bg-slate-700/50 text-slate-300'}`}
              >Spotify</button>
            </div>
            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 font-medium text-white disabled:opacity-50"
            >Create</button>
          </div>
        </div>

        {/* Join */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
          <h2 className="mb-3 font-semibold text-white">Join a Room</h2>
          <div className="space-y-3">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter code (e.g. 7KD4ZQ)"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={doJoin}
              disabled={loading}
              className="w-full rounded-lg bg-slate-700 py-2.5 font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50"
            >Join</button>
          </div>
        </div>
      </div>
      {message && <p className="mt-4 text-sm text-rose-400">{message}</p>}
    </div>
  );
}


