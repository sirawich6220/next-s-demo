import { NextResponse } from 'next/server';

export function middleware(request) {
  const adminId = "711119862302375956";
  const userCookie = request.cookies.get('discord_user');

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!userCookie) return NextResponse.redirect(new URL('/', request.url));
    
    const user = JSON.parse(userCookie.value);
    if (user.id !== adminId) {
        return NextResponse.redirect(new URL('/profile', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};