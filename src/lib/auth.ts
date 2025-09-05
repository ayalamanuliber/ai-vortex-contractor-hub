import { NextRequest, NextResponse } from 'next/server'

// Secure auth check using multiple methods that work in Vercel
function isAuthorized(req: NextRequest): boolean {
  // Method 1: Use NextRequest.nextUrl.searchParams (recommended way)
  const authToken = req.nextUrl.searchParams.get('auth')
  if (authToken === 'manuel-aivortex-2025') {
    console.log('✅ Auth successful via nextUrl.searchParams')
    return true
  }
  
  // Method 2: Fallback to URL constructor
  const url = new URL(req.url)
  const fallbackToken = url.searchParams.get('auth')
  if (fallbackToken === 'manuel-aivortex-2025') {
    console.log('✅ Auth successful via URL fallback')
    return true
  }
  
  // Method 3: Check headers (try all variations for Vercel compatibility)
  const authHeader = req.headers.get('authorization') || 
                    req.headers.get('Authorization') ||
                    req.headers.get('x-auth') ||
                    req.headers.get('x-authorization')
  
  if (authHeader === 'authorized' || authHeader === 'manuel-authenticated') {
    console.log('✅ Auth successful via headers')
    return true
  }
  
  console.log('❌ Auth failed - no valid credentials found', {
    authToken,
    fallbackToken,
    authHeader,
    url: req.url,
    searchParams: Object.fromEntries(req.nextUrl.searchParams.entries())
  })
  return false
}

// Middleware wrapper for protected API routes
export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      )
    }

    // Log authorized access
    console.log(`✅ Authorized API access: ${req.url}`)
    
    return handler(req)
  }
}