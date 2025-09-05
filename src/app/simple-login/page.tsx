'use client'

import { useState } from 'react'

export default function SimpleLogin() {
  const [email, setEmail] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (email !== 'manuel@aivortex.io') {
      setError('Email no autorizado')
      return
    }

    setIsChecking(true)
    
    // Simple auth - just store in localStorage
    localStorage.setItem('authorized', 'true')
    localStorage.setItem('userEmail', email)
    
    // Redirect to main app
    window.location.href = '/'
  }

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

        {/* Login Card */}
        <div className="bg-[#0a0a0b] border border-white/[0.06] rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-[18px] font-semibold text-white mb-2">
              Acceso Autorizado
            </h1>
            <p className="text-[13px] text-white/50">
              Ingrese su email autorizado
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manuel@aivortex.io"
                className="w-full px-4 py-3 bg-[#050505] border border-white/[0.06] rounded-lg text-white text-[14px] placeholder-white/30 focus:outline-none focus:border-white/20"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-[12px] text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isChecking}
              className="w-full px-4 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Verificando...' : 'Ingresar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}