import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('spotify_access_token')?.value;
  if (!access) return new NextResponse('No token', { status: 401 });
  return NextResponse.json({ access_token: access });
}


