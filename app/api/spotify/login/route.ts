import { NextResponse } from 'next/server';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!clientId || !baseUrl) {
    return new NextResponse('Missing SPOTIFY_CLIENT_ID or NEXT_PUBLIC_BASE_URL', { status: 500 });
  }
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: `${baseUrl}/api/spotify/callback`,
    scope: SCOPES,
  });
  const url = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  return NextResponse.redirect(url);
}


