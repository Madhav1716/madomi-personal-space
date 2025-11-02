'use client';

import { useState } from 'react';
import type { RoomMode } from '@/types';
import { getRoomChannel } from '@/lib/realtime';

interface Props {
  playlist: string[];
  current: string | null;
  onPlay: (id: string) => void;
  mode?: RoomMode;
  roomId?: string;
}

export default function Playlist({ playlist, current, onPlay, mode = 'youtube', roomId }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const addToPlaylist = (id?: string) => {
    if (typeof window === 'undefined') return;
    const videoId = id || inputValue.trim();
    if (!videoId) {
      setShowInput(true);
      return;
    }
    try {
      const newList = playlist.includes(videoId) ? playlist : [...playlist, videoId];
      const rid = roomId || 'default-room';
      const channel = getRoomChannel(rid);
      channel.send({ type: 'broadcast', event: 'play', payload: { videoId, playlist: newList } });
      setInputValue('');
      setShowInput(false);
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  };

  const handlePrompt = () => {
    const id = prompt(
      mode === 'spotify'
        ? 'Enter Spotify URI or URL:\n(e.g., spotify:track:... or https://open.spotify.com/track/...)'
        : 'Enter YouTube Video ID or URL:\n(e.g., dQw4w9WgXcQ or https://youtube.com/watch?v=dQw4w9WgXcQ)'
    );
    if (!id?.trim()) return;
    
    if (mode === 'spotify') {
      try {
        // Extract Spotify URI
        const uri = id.includes('open.spotify.com')
          ? id.match(/open\.spotify\.com\/track\/([^?]+)/)?.[1]
            ? `spotify:track:${id.match(/open\.spotify\.com\/track\/([^?]+)/)?.[1]}`
            : id.trim()
          : id.trim();
        const newList = playlist.includes(uri) ? playlist : [...playlist, uri];
        const rid = roomId || 'default-room';
        const channel = getRoomChannel(rid);
        channel.send({ type: 'broadcast', event: 'play-spotify', payload: { uri, playlist: newList } });
        setInputValue('');
        setShowInput(false);
      } catch (error) {
        console.error('Error adding Spotify track:', error);
      }
      return;
    }

    // Extract YouTube ID
    const videoId = id.includes('youtube.com') || id.includes('youtu.be')
      ? id.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] || id.trim()
      : id.trim();
    addToPlaylist(videoId);
  };

  return (
    <div className="rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 shadow-xl">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-400"
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
            <h3 className="font-semibold text-white">Playlist</h3>
            <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300">
              {playlist.length}
            </span>
          </div>
          <button
            onClick={handlePrompt}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 shadow-lg shadow-blue-500/30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        {showInput && (
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Video ID or URL"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToPlaylist()}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
            <button
              onClick={() => addToPlaylist()}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setInputValue('');
              }}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="max-h-64 md:max-h-80 space-y-1.5 overflow-y-auto">
          {playlist.length === 0 ? (
            <div className="py-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-600"
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
              <p className="mt-2 text-sm text-slate-400">Your playlist is empty</p>
              <p className="mt-1 text-xs text-slate-500">Add videos to get started</p>
            </div>
          ) : (
            playlist.map((id, index) => (
              <div
                key={id}
                className={`group flex items-center justify-between rounded-lg p-2.5 transition-all ${
                  id === current
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/50'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded text-xs font-medium text-slate-400">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-white">{id}</span>
                  {id === current && (
                    <span className="ml-1 flex items-center gap-0.5 text-xs text-blue-400">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                      Playing
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onPlay(id)}
                  className="ml-2 rounded-lg bg-blue-600/80 px-3 py-1 text-xs font-medium text-white opacity-0 transition-all hover:bg-blue-500 group-hover:opacity-100"
                >
                  Play
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}