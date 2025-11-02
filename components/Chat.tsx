'use client';

import { useState, useEffect, useRef } from 'react';
import { getRoomChannel } from '@/lib/realtime';
import { Message } from '@/types';

interface Props {
  name: string;
  roomId?: string;
}

export default function Chat({ name, roomId }: Props) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!msg.trim() || typeof window === 'undefined') return;
    try {
      const rid = roomId || 'default-room';
      const channel = getRoomChannel(rid);
      channel.send({ type: 'broadcast', event: 'chat', payload: { name, message: msg } });
      setMsg('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendHeart = () => {
    if (typeof window === 'undefined') return;
    try {
      const rid = roomId || 'default-room';
      const channel = getRoomChannel(rid);
      channel.send({ type: 'broadcast', event: 'chat', payload: { name, message: '❤️' } });
    } catch (error) {
      console.error('Error sending heart:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rid = roomId || 'default-room';
      const channel = getRoomChannel(rid);
      channel.on('broadcast', { event: 'chat' }, (payload: any) => {
        const m = payload.payload as Message;
        setMessages((prev) => [...prev, m]);
      });
    } catch (error) {
      console.error('Error setting up chat listener:', error);
    }
  }, [roomId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-[60vh] md:h-[500px] flex-col rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="font-semibold text-white">Chat</h3>
            <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300">
              {messages.length}
            </span>
          </div>
          <button
            onClick={sendHeart}
            className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 p-2 text-xl transition-all hover:from-rose-400 hover:to-pink-400 active:scale-95 shadow-lg shadow-rose-500/30"
            title="Send a heart"
          >
            ❤️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-2 text-sm text-slate-400">No messages yet</p>
              <p className="mt-1 text-xs text-slate-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.name === name ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  m.name === name
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-slate-700/50 text-slate-200'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${m.name === name ? 'text-blue-100' : 'text-slate-400'}`}>
                  {m.name === name ? 'You' : m.name}
                </div>
                <div className="break-words text-sm leading-relaxed">{m.message}</div>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="flex gap-2">
          <input
            placeholder="Type a message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
          <button
            onClick={send}
            disabled={!msg.trim()}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-medium text-white transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}