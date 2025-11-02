export type RoomMode = 'youtube' | 'spotify';

export interface RoomState {
  // Common
  mode?: RoomMode;
  playlist: string[];
  time?: number;
  // YouTube
  videoId: string | null;
  // Spotify
  spotifyUri?: string | null;
}

export interface Message {
  name: string;
  message: string;
}

