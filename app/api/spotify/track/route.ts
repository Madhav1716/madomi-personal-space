import { NextRequest, NextResponse } from 'next/server';

function extractId(input: string, type: 'track' | 'playlist' | 'album'): string | null {
  if (!input) return null;
  
  // Handle URI format: spotify:track:xxx or spotify:playlist:xxx
  if (input.startsWith(`spotify:${type}:`)) {
    return input.split(':')[2] || null;
  }
  
  // Handle URL format: open.spotify.com/track/xxx or open.spotify.com/playlist/xxx
  const m = input.match(new RegExp(`open\\.spotify\\.com/${type}/([^?]+)`));
  return m?.[1] || null;
}

export async function GET(req: NextRequest) {
  const uri = req.nextUrl.searchParams.get('uri');
  if (!uri) return new NextResponse('Missing uri', { status: 400 });

  const access = req.cookies.get('spotify_access_token')?.value;
  if (!access) return new NextResponse('No token', { status: 401 });

  // Check if it's a playlist
  const playlistId = extractId(uri, 'playlist');
  if (playlistId) {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${access}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text || 'Failed to fetch', { status: res.status });
    }
    const json = await res.json();
    return NextResponse.json({
      id: json.id,
      name: json.name,
      artists: json.owner?.display_name || 'Spotify',
      album: '',
      image: json.images?.[0]?.url || null,
      durationMs: 0,
      previewUrl: null,
      type: 'playlist',
    });
  }

  // Check if it's a track
  const trackId = extractId(uri, 'track');
  if (!trackId) return new NextResponse('Invalid track or playlist uri', { status: 400 });

  const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text || 'Failed to fetch', { status: res.status });
  }
  const json = await res.json();
  return NextResponse.json({
    id: json.id,
    name: json.name,
    artists: (json.artists || []).map((a: any) => a.name).join(', '),
    album: json.album?.name || '',
    image: json.album?.images?.[0]?.url || null,
    durationMs: json.duration_ms,
    previewUrl: json.preview_url,
    type: 'track',
  });
}


