import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const url =
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
    socket = io(url, { path: '/api/socket' });
  }
  return socket;
};