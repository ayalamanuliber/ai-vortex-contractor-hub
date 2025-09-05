import { NextRequest, NextResponse } from 'next/server'

// Simple auth check with debug logging
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  
  // Emergency debugging for production
  console.log('🚨 AUTH DEBUG:', {
    authHeader,
    authHeaderType: typeof authHeader,
    authHeaderLength: authHeader?.length,
    allHeaders: Object.fromEntries(req.headers.entries()),
    url: req.url,
    timestamp: new Date().toISOString()
  })
  
  // More robust checking
  if (!authHeader) {
    console.log('❌ No authorization header found')
    return false
  }
  
  const isAuth = authHeader === 'authorized'
  console.log(isAuth ? '✅ Auth successful' : `❌ Auth failed: "${authHeader}" !== "authorized"`)
  return isAuth
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