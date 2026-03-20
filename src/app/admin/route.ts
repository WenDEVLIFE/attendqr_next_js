import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const redirects: Record<string, string> = {
    '/admin': '/auth/login',
    '/admin/admin_users': '/auth/admin_users',
    '/admin/admin_activity_logs': '/auth/admin_activity_logs',
    '/admin/admin_dashboard': '/auth/admin_dashboard',
  };

  const target = redirects[pathname];
  if (!target) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url);
}