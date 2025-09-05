'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    google: any;
    handleCredentialResponse: (response: any) => void;
  }
}

export default function GoogleLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: "70180475282-e72ttrdmsd1klg741fp020ld8u1p56ed.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      })

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "filled_black",
          size: "large",
          type: "standard",
          shape: "rounded",
          text: "continue_with",
          width: "100%",
        }
      )
    }

    // Global callback function
    window.handleCredentialResponse = handleCredentialResponse

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true)
    setError('')

    try {
      // Decode JWT token
      const token = response.credential
      const payload = JSON.parse(atob(token.split('.')[1]))
      const email = payload.email

      // Check if email is authorized
      if (email === 'manuel@aivortex.io') {
        // Store auth info
        localStorage.setItem('authorized', 'true')
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userName', payload.name)
        localStorage.setItem('userPicture', payload.picture)
        
        // Redirect to main app
        window.location.href = '/'
      } else {
        setError('Tu email no está autorizado para acceder al sistema')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Error al procesar el login. Intenta nuevamente.')
      setIsLoading(false)
    }
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
              Inicia Sesión
            </h1>
            <p className="text-[13px] text-white/50">
              Acceso restringido a usuarios autorizados únicamente
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            {!isLoading ? (
              <div id="google-signin-button" className="w-full"></div>
            ) : (
              <div className="w-full flex items-center justify-center py-3 bg-[#050505] border border-white/[0.06] rounded-lg">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mr-3"></div>
                <span className="text-white/70 text-[14px]">Verificando acceso...</span>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-red-300 text-[12px] text-center">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-[#050505] border border-white/[0.06] rounded-md">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-[#22c55e] mt-0.5 flex-shrink-0"></div>
              <div className="text-[12px] text-white/70">
                <div className="font-medium mb-1">Acceso Seguro</div>
                <div>Solo miembros autorizados del equipo pueden acceder a este sistema.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[11px] text-white/30">
          Protegido por autenticación empresarial
        </div>
      </div>
    </div>
  )
}