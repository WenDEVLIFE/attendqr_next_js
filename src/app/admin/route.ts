import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  return NextResponse.redirect(url);
}
