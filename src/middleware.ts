import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'sp_admin_session';

// guard admin routes so unauthenticated requests go to /admin/login
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token || !token.includes('.')) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
