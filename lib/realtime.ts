import { getSupabaseClient } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

const roomIdToChannel: Record<string, RealtimeChannel> = {};

export function getRoomChannel(roomId: string): RealtimeChannel {
  if (typeof window === 'undefined') {
    // During SSR/build, we can't use realtime channels
    // Create a dummy channel that won't break, but won't work either
    const supabase = getSupabaseClient();
    return supabase.channel(`room:${roomId}-dummy`);
  }
  
  if (!roomIdToChannel[roomId]) {
    try {
      const supabase = getSupabaseClient();
      const channel = supabase.channel(`room:${roomId}`, {
        config: { broadcast: { self: true } },
      });
      // Subscribe the channel - this initiates the connection
      const sub = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Channel is ready
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Channel ${roomId} subscription error`);
        }
      });
      roomIdToChannel[roomId] = channel;
    } catch (error) {
      console.error('Error creating realtime channel:', error);
      // Fallback: return a basic channel
      const supabase = getSupabaseClient();
      const fallback = supabase.channel(`room:${roomId}`);
      fallback.subscribe();
      return fallback;
    }
  }
  return roomIdToChannel[roomId];
}


