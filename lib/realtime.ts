import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

const roomIdToChannel: Record<string, RealtimeChannel> = {};

export function getRoomChannel(roomId: string): RealtimeChannel {
  if (!roomIdToChannel[roomId]) {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: true } },
    });
    channel.subscribe((status) => {
      // no-op; consumer can rely on lazy connection
    });
    roomIdToChannel[roomId] = channel;
  }
  return roomIdToChannel[roomId];
}


