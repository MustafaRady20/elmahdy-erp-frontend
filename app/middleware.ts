import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/employees', '/cafes', '/revenues', '/attendance'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/employees/:path*', '/cafes/:path*', '/revenues/:path*', '/attendance/:path*'],
};
