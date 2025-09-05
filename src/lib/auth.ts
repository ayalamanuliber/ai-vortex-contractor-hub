import { NextRequest, NextResponse } from 'next/server'

// Secure auth check using cookies - most reliable method for Vercel Edge Network
function isAuthorized(req: NextRequest): boolean {
  // Method 1: Check secure auth cookie (most reliable in Vercel)
  const authCookie = req.cookies.get('manuel-auth-token')
  if (authCookie?.value === 'manuel-aivortex-2025-verified') {
    console.log('✅ Auth successful via secure cookie')
    return true
  }
  
  // Method 2: Check session cookie
  const sessionCookie = req.cookies.get('manuel-session')  
  if (sessionCookie?.value === 'authenticated') {
    console.log('✅ Auth successful via session cookie')
    return true
  }
  
  // Method 3: Fallback to query params (for curl testing)
  const authToken = req.nextUrl.searchParams.get('auth')
  if (authToken === 'manuel-aivortex-2025') {
    console.log('✅ Auth successful via query params fallback')
    return true
  }
  
  // Method 4: Check headers as final fallback
  const authHeader = req.headers.get('authorization') || 
                    req.headers.get('x-auth')
  
  if (authHeader === 'manuel-authenticated') {
    console.log('✅ Auth successful via headers fallback')
    return true
  }
  
  console.log('❌ Auth failed - no valid credentials found', {
    cookies: {
      authToken: !!authCookie,
      session: !!sessionCookie,
      all: req.cookies.getAll()
    },
    authToken,
    authHeader,
    url: req.url,
    method: req.method
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