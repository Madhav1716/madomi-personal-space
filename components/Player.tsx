'use client';

import YouTube from 'react-youtube';
import { useRef, useEffect } from 'react';
import { getRoomChannel } from '@/lib/realtime';

interface Props {
  videoId: string | null;
  onTimeUpdate: (time: number) => void;
  roomId?: string;
  startTime?: number;
}

export default function Player({ videoId, onTimeUpdate, roomId, startTime }: Props) {
  const playerRef = useRef<any>(null);

  const opts = {
    width: '100%',
    height: '360',
    playerVars: { autoplay: 1 } as const,
  };

  const onReady = (e: any) => {
    playerRef.current = e.target;
  };

  const onStateChange = (e: any) => {
    if (e.data === 1) {
      // playing
      const rid = roomId || 'default-room';
      const channel = getRoomChannel(rid);
      channel.send({ type: 'broadcast', event: 'sync-time', payload: { time: e.target.getCurrentTime() } });
    }
  };

  useEffect(() => {
    if (!videoId || !playerRef.current) return;
    if (startTime && startTime > 0) {
      playerRef.current.loadVideoById(videoId, startTime);
    } else {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId, startTime]);

  // Periodic sync (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current?.getPlayerState() === 1) {
        onTimeUpdate(playerRef.current.getCurrentTime());
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50">
            <svg
              className="h-8 w-8 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No video playing</p>
          <p className="mt-1 text-sm text-slate-500">Add a video to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className="aspect-video w-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}