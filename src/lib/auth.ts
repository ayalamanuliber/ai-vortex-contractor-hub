import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to check if user is authenticated
export async function getAuthSession() {
  return await getServerSession(authOptions)
}

// Middleware wrapper for protected API routes
export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const session = await getAuthSession()
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      )
    }

    // Check if user is in authorized list
    const authorizedEmails = (process.env.AUTHORIZED_EMAILS || '').split(',').map(email => email.trim())
    if (!authorizedEmails.includes(session.user.email)) {
      console.log(`🚨 Unauthorized API access attempt: ${session.user.email}`)
      return NextResponse.json(
        { error: 'Forbidden - Access denied' }, 
        { status: 403 }
      )
    }

    // Log authorized access
    console.log(`✅ Authorized API access: ${session.user.email} - ${req.url}`)
    
    return handler(req)
  }
}

// Type for session user
export interface AuthUser {
  email: string
  name?: string | null
  image?: string | null
}