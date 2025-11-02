'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { RoomMode, RoomState } from '@/types';
import { getRoomChannel } from '@/lib/realtime';
import Player from '@/components/Player';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import Playlist from '@/components/Playlist';
import Chat from '@/components/Chat';
import CopyButton from '@/components/CopyButton';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = useMemo(() => String(params?.id || ''), [params]);
  const [mode, setMode] = useState<RoomMode>('youtube');
  const [roomName, setRoomName] = useState<string>('Room');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string>('');
  const [state, setState] = useState<RoomState>({ videoId: null, playlist: [] });

  // Auth guard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login');
      const display = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'You';
      setMe(display);
      setMyUserId(data.user?.id ?? null);
    });
  }, [router]);

  // Load room (mode)
  useEffect(() => {
    if (!roomId) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase
          .from('rooms')
          .select('mode, join_code, name, owner_id')
          .eq('id', roomId)
          .single();
        if (!active) return;
        if (data?.mode === 'spotify' || data?.mode === 'youtube') setMode(data.mode);
        if (data?.join_code) setJoinCode(data.join_code);
        if (data?.name) setRoomName(data.name);
        if (data?.owner_id) setOwnerId(data.owner_id);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [roomId]);

  // Realtime listeners
  useEffect(() => {
    if (!roomId) return;
    const channel = getRoomChannel(roomId);
    channel.on('broadcast', { event: 'play' }, (payload: any) => {
      const { videoId, playlist, time } = payload.payload || {};
      setState({ videoId, playlist: playlist || [], time, mode: 'youtube' });
    });
    channel.on('broadcast', { event: 'play-spotify' }, (payload: any) => {
      const { uri, playlist, time } = payload.payload || {};
      setState({ videoId: null, spotifyUri: uri, playlist: playlist || [], time, mode: 'spotify' });
    });
  }, [roomId]);

  const handleTime = (time: number) => {
    const channel = getRoomChannel(roomId);
    channel.send({ type: 'broadcast', event: 'sync-time', payload: { time } });
  };

  const play = (id: string) => {
    const newList = state.playlist.includes(id) ? state.playlist : [...state.playlist, id];
    const channel = getRoomChannel(roomId);
    if (mode === 'spotify') {
      channel.send({ type: 'broadcast', event: 'play-spotify', payload: { uri: id, playlist: newList } });
    } else {
      channel.send({ type: 'broadcast', event: 'play', payload: { videoId: id, playlist: newList } });
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-slate-700/50 bg-slate-800/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{roomName}</h1>
                <p className="text-sm text-slate-400">{ownerId && myUserId && ownerId === myUserId ? 'Created by you' : 'Created by owner'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs text-slate-300 sm:block">ID: {roomId}</div>
              {joinCode && (
                <div className="hidden rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs text-slate-300 sm:block">Code: {joinCode}</div>
              )}
              <CopyButton value={shareUrl} label="Copy link" />
              <button
                onClick={() => {
                  const channel = getRoomChannel(roomId);
                  channel.send({ type: 'broadcast', event: 'chat', payload: { name: me, message: '❤️' } });
                }}
                className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 p-2.5 text-xl transition-all hover:from-rose-400 hover:to-pink-400 active:scale-95 shadow-lg shadow-rose-500/30"
                title="Send a heart"
              >
                ❤️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900 text-slate-500">
                Loading room…
              </div>
            ) : mode === 'spotify' ? (
              <SpotifyPlayer uri={state.spotifyUri} />
            ) : (
              <Player videoId={state.videoId} onTimeUpdate={handleTime} roomId={roomId} />
            )}
            <div className="rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400">Items in Queue</div>
                  <div className="text-2xl font-bold text-white">{state.playlist.length}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Now Playing</div>
                  <div className="text-sm font-medium text-white truncate">{mode === 'spotify' ? state.spotifyUri || 'None' : state.videoId || 'None'}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Playlist playlist={state.playlist} current={state.videoId} onPlay={play} mode={mode} roomId={roomId} />
            <Chat name={me} roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
}


