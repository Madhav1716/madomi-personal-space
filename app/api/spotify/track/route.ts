import { NextRequest, NextResponse } from 'next/server';

function extractTrackId(input: string): string | null {
  if (!input) return null;
  if (input.startsWith('spotify:track:')) return input.split(':')[2] || null;
  const m = input.match(/open\.spotify\.com\/track\/([^?]+)/);
  return m?.[1] || null;
}

export async function GET(req: NextRequest) {
  const uri = req.nextUrl.searchParams.get('uri');
  if (!uri) return new NextResponse('Missing uri', { status: 400 });
  const id = extractTrackId(uri);
  if (!id) return new NextResponse('Invalid track uri', { status: 400 });

  const access = req.cookies.get('spotify_access_token')?.value;
  if (!access) return new NextResponse('No token', { status: 401 });

  const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text || 'Failed to fetch', { status: res.status });
  }
  const json = await res.json();
  const data = {
    id: json.id,
    name: json.name,
    artists: (json.artists || []).map((a: any) => a.name).join(', '),
    album: json.album?.name || '',
    image: json.album?.images?.[0]?.url || null,
    durationMs: json.duration_ms,
    previewUrl: json.preview_url,
  };
  return NextResponse.json(data);
}


