'use client';

import { useState } from 'react';
import type { RoomMode } from '@/types';
import { getSocket } from '@/lib/socket';

interface Props {
  onJoin: (name: string, mode: RoomMode) => void;
}

export default function JoinRoom({ onJoin }: Props) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<RoomMode>('youtube');

  const handleJoin = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    const socket = getSocket();
    socket.emit('join', { room: ROOM_ID, name, mode });
    onJoin(name, mode);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-500/50">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Madomi Personal Space</h1>
          <p className="text-slate-400">Listen together, share the moment</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-800/90 p-8 shadow-2xl backdrop-blur-sm border border-slate-700/50">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Enter your name
              </label>
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Choose a mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('youtube')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    mode === 'youtube'
                      ? 'border-blue-500 bg-blue-600/20 text-blue-200'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => setMode('spotify')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    mode === 'spotify'
                      ? 'border-emerald-500 bg-emerald-600/20 text-emerald-200'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Spotify (Premium)
                </button>
              </div>
              {mode === 'spotify' && (
                <p className="mt-2 text-xs text-slate-400">
                  Requires Spotify Premium for playback. You'll log in after joining.
                </p>
              )}
            </div>
            <button
              onClick={handleJoin}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-blue-500/60 active:scale-[0.98]"
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Room: {ROOM_ID}
        </p>
      </div>
    </div>
  );
}

/** CHANGE THIS to something only you two know */
export const ROOM_ID = 'alex-emma-forever-2025';