import { NextRequest, NextResponse } from 'next/server'

// Simple auth check
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  return authHeader === 'authorized'
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