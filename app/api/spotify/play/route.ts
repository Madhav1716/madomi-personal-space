import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const access = req.cookies.get('spotify_access_token')?.value;
  if (!access) return new NextResponse('No token', { status: 401 });
  const { deviceId, uri, positionMs } = await req.json();
  if (!deviceId || !uri) return new NextResponse('Missing deviceId or uri', { status: 400 });

  const body: any = uri.startsWith('spotify:')
    ? { uris: [uri], position_ms: positionMs || 0 }
    : { context_uri: uri, position_ms: positionMs || 0 };

  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text || 'Playback failed', { status: res.status });
  }
  return NextResponse.json({ ok: true });
}


