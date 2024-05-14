import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({ req });

    // Check is auth
    const isAuth = !!token;

    // Check auth page
    const isAuthPage =
      req.nextUrl.pathname === '/' ||
      req.nextUrl.pathname.startsWith('/auth/login') ||
      req.nextUrl.pathname.startsWith('/auth/register');

    // Redirect
    if (req.nextUrl.pathname === '/')
      return NextResponse.redirect(new URL('/auth/login', req.url));

    // Check auth auth page
    if (isAuthPage) {
      // Check auth and redirect url
      if (isAuth)
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));

      return null;
    }

    // Check page
    if (!isAuth) {
      // From pathname
      let from = req.nextUrl.pathname;

      // Search params
      if (req.nextUrl.search) from += req.nextUrl.search;

      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        return true;
      },
    },
  },
);

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/'],
};
