import { NextRequest, NextResponse } from 'next/server'

// Simple auth check with robust header handling
function isAuthorized(req: NextRequest): boolean {
  // Try multiple ways to get the authorization header (Vercel compatibility)
  const authHeader1 = req.headers.get('authorization')
  const authHeader2 = req.headers.get('Authorization')
  const allHeaders = Object.fromEntries(req.headers.entries())
  const authHeader3 = allHeaders['authorization']
  const authHeader4 = allHeaders['Authorization']
  
  const authHeader = authHeader1 || authHeader2 || authHeader3 || authHeader4
  
  // Debug logging
  console.log('🔍 AUTH DEBUG:', {
    authHeader1,
    authHeader2, 
    authHeader3,
    authHeader4,
    finalAuth: authHeader,
    allHeaders,
    url: req.url,
    timestamp: new Date().toISOString()
  })
  
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