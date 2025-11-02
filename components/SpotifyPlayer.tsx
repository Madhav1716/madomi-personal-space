'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  uri: string | null | undefined;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

export default function SpotifyPlayer({ uri }: Props) {
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

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
      player.addListener('ready', () => setReady(true));
      player.addListener('initialization_error', ({ message }: any) => console.error(message));
      player.addListener('authentication_error', ({ message }: any) => console.error(message));
      player.addListener('account_error', ({ message }: any) => console.error(message));
      player.connect();
      playerRef.current = player;
    };
  }, []);

  useEffect(() => {
    if (!uri || !playerRef.current) return;
    // Playback is controlled by server broadcast in a complete implementation.
    // Here we just render UI; control actions would live elsewhere.
  }, [uri]);

  if (!authorized) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-slate-300">Connect Spotify to listen here</p>
          <a
            href="/api/spotify/login"
            className="mt-3 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-500"
          >
            Login to Spotify
          </a>
        </div>
      </div>
    );
  }

  if (!uri) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <p className="text-slate-400">No track selected</p>
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900">
      <div className="text-center">
        <div className="mb-2 text-xs uppercase tracking-wider text-emerald-400">Spotify</div>
        <div className="text-slate-200">{uri}</div>
      </div>
    </div>
  );
}


