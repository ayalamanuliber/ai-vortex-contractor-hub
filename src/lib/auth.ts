import { NextRequest, NextResponse } from 'next/server'

// Secure auth check using multiple methods that work in Vercel
function isAuthorized(req: NextRequest): boolean {
  const url = new URL(req.url)
  
  // Method 1: Check for auth token in query params (always works in Vercel)
  const authToken = url.searchParams.get('auth')
  if (authToken === 'manuel-aivortex-2025') {
    console.log('✅ Auth successful via query param')
    return true
  }
  
  // Method 2: Check headers (try all variations for Vercel compatibility)
  const authHeader = req.headers.get('authorization') || 
                    req.headers.get('Authorization') ||
                    req.headers.get('x-auth') ||
                    req.headers.get('x-authorization')
  
  if (authHeader === 'authorized' || authHeader === 'manuel-authenticated') {
    console.log('✅ Auth successful via headers')
    return true
  }
  
  console.log('❌ Auth failed - no valid credentials found')
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