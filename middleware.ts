import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/enseignant', '/eleve', '/parent', '/chauffeur'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const authSession = request.cookies.get('auth_session')?.value;
  if (!authSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/enseignant/:path*',
    '/eleve/:path*',
    '/parent/:path*',
    '/chauffeur/:path*',
  ],
};
