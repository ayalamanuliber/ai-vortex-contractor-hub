'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-[24px] font-bold text-white tracking-tight mb-2">
            AI VORTEX
          </div>
          <div className="text-[14px] text-white/50 font-medium">
            Contractor Intelligence Hub
          </div>
        </div>

        {/* Error Card */}
        <div className="bg-[#0a0a0b] border border-red-500/20 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-[18px] font-semibold text-red-400 mb-2">
              Access Denied
            </h1>
            
            <p className="text-[14px] text-white/70 mb-4">
              Your email address is not authorized to access this system.
            </p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4">
                <p className="text-[12px] text-red-300 font-mono">
                  Error: {error}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link 
              href="/auth/signin"
              className="w-full block text-center px-4 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              Try Again
            </Link>
            
            <div className="text-center">
              <p className="text-[12px] text-white/50">
                Need access? Contact your administrator
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-[#050505] border border-white/[0.06] rounded-md">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-[#fb923c] mt-0.5 flex-shrink-0"></div>
              <div className="text-[12px] text-white/70">
                <div className="font-medium mb-1">Security Notice</div>
                <div>This system is restricted to authorized personnel only. All access attempts are logged and monitored.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[11px] text-white/30">
          Protected by enterprise-grade security
        </div>
      </div>
    </div>
  )
}