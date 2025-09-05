import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all API routes to pass through - auth will be handled by the API themselves
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow access to login page and static assets
  if (
    pathname.startsWith('/simple-login') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('favicon.ico') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next()
  }

  // For page routes, we'll let the client-side check handle redirects
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}