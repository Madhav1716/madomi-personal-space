import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return new NextResponse('Missing code', { status: 400 });

  const clientId = process.env.SPOTIFY_CLIENT_ID as string;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;
  const baseUrl = req.nextUrl.origin;

  if (!clientId || !clientSecret || !baseUrl) {
    return new NextResponse('Missing Spotify env vars', { status: 500 });
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${baseUrl}/api/spotify/callback`,
  });

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body,
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return new NextResponse(`Token exchange failed: ${text}`, { status: 400 });
  }

  const json = await tokenRes.json();
  const resp = NextResponse.redirect(new URL('/', baseUrl));
  // Store tokens in httpOnly cookies for demo purposes
  resp.cookies.set('spotify_access_token', json.access_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  if (json.refresh_token) {
    resp.cookies.set('spotify_refresh_token', json.refresh_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  }
  return resp;
}


