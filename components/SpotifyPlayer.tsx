'use client';

import { useEffect, useRef, useState } from 'react';

import { getRoomChannel } from '@/lib/realtime';

interface Props {
  uri: string | null | undefined;
  roomId?: string;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

export default function SpotifyPlayer({ uri, roomId }: Props) {
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ image: string | null; name: string; artists: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  // Load SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.getElementById('spotify-sdk');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Init player when SDK ready
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.onSpotifyWebPlaybackSDKReady = async () => {
      const tokenRes = await fetch('/api/spotify/token');
      if (!tokenRes.ok) {
        setAuthorized(false);
        setReady(true);
        return;
      }
      const { access_token } = await tokenRes.json();
      setAuthorized(Boolean(access_token));
      const player = new window.Spotify.Player({
        name: 'Madomi Personal Space',
        getOAuthToken: (cb: (t: string) => void) => cb(access_token),
        volume: 0.8,
      });
      player.addListener('ready', ({ device_id }: any) => { 
        setReady(true); 
        setDeviceId(device_id);
        // Transfer playback to this web device (so it doesn't open desktop app)
        (async () => {
          try {
            const tokenRes = await fetch('/api/spotify/token');
            if (!tokenRes.ok) return;
            const { access_token } = await tokenRes.json();
            await fetch('https://api.spotify.com/v1/me/player', {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ device_ids: [device_id], play: false }),
            });
          } catch {}
        })();
      });
      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        setIsPlaying(!state.paused);
        if (state.track_window?.current_track) {
          setCurrentTrack(state.track_window.current_track.uri);
        }
      });
      player.addListener('initialization_error', ({ message }: any) => console.error(message));
      player.addListener('authentication_error', ({ message }: any) => console.error(message));
      player.addListener('account_error', ({ message }: any) => console.error(message));
      player.connect();
      playerRef.current = player;
    };
  }, []);

  useEffect(() => {
    if (!uri || !playerRef.current || !deviceId || currentTrack === uri) return;
    // Play the track (API will transfer to web device first)
    fetch('/api/spotify/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, uri }),
    }).catch(() => {});
  }, [uri, deviceId, currentTrack]);

  // Fetch metadata for display (tries to get, but gracefully falls back)
  useEffect(() => {
    if (!uri) { setMeta(null); return; }
    setMeta(null); // Reset while loading
    fetch(`/api/spotify/track?uri=${encodeURIComponent(uri)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setMeta({ image: d.image, name: d.name, artists: d.artists });
        }
      })
      .catch(() => {
        // If fetch fails, we'll just show the URI
      });
  }, [uri]);

  if (!uri) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-slate-400">No track selected</p>
          {!authorized && (
            <>
              <p className="mt-2 text-sm text-slate-500">Connect Spotify to play music</p>
              <a
                href="/api/spotify/login"
                className="mt-3 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white shadow hover:bg-emerald-500"
              >
                Login to Spotify
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  // Listen for play/pause sync from other users
  useEffect(() => {
    if (!roomId || !authorized) return;
    const channel = getRoomChannel(roomId);
    let pauseSub: any;
    let resumeSub: any;
    
    channel.on('broadcast', { event: 'spotify-pause' }, () => {
      if (playerRef.current) playerRef.current.pause();
    }).subscribe((status) => {
      pauseSub = status;
    });
    
    channel.on('broadcast', { event: 'spotify-resume' }, () => {
      if (playerRef.current) playerRef.current.resume();
    }).subscribe((status) => {
      resumeSub = status;
    });
    
    return () => {
      // Supabase handles cleanup automatically when channel is removed
    };
  }, [roomId, authorized]);

  const togglePlayPause = async () => {
    if (!playerRef.current || !authorized || !roomId) return;
    const channel = getRoomChannel(roomId);
    if (isPlaying) {
      await playerRef.current.pause();
      channel.send({ type: 'broadcast', event: 'spotify-pause', payload: {} });
    } else {
      await playerRef.current.resume();
      channel.send({ type: 'broadcast', event: 'spotify-resume', payload: {} });
    }
  };

  return (
    <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-4 p-6 w-full max-w-2xl z-10">
        {meta?.image ? (
          <img src={meta.image} alt={meta.name} className="h-32 w-32 md:h-40 md:w-40 rounded-lg object-cover shadow-lg" />
        ) : (
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-lg bg-slate-800 flex items-center justify-center">
            <svg className="h-12 w-12 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <div className="text-xs uppercase tracking-wider text-emerald-400 mb-2">Spotify</div>
          <div className="text-xl md:text-2xl font-bold text-white line-clamp-2 mb-1">{meta?.name || uri}</div>
          <div className="text-base text-slate-300 line-clamp-1 mb-3">{meta?.artists || 'Loading...'}</div>
          {!authorized && (
            <div className="mt-2">
              <a
                href="/api/spotify/login"
                className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-500"
              >
                Login to Spotify to play
              </a>
            </div>
          )}
          {authorized && ready && (
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={togglePlayPause}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="text-xs text-emerald-400">{isPlaying ? 'Playing' : 'Paused'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


