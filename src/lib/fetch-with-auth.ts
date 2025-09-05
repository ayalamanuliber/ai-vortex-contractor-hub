// Helper to make authenticated requests using cookies (Vercel-safe method)
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const isAuthorized = localStorage.getItem('authorized') === 'true'
  
  if (!isAuthorized) {
    window.location.href = '/simple-login'
    return
  }

  // Set auth cookies for secure authentication (Vercel Edge Network compatible)
  // Expire in 8 hours for security
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString()
  document.cookie = `manuel-auth-token=manuel-aivortex-2025-verified; path=/; secure; samesite=strict; expires=${expires}; httponly=false`
  document.cookie = `manuel-session=authenticated; path=/; secure; samesite=strict; expires=${expires}; httponly=false`

  // Keep headers and URL params as fallback for testing
  const urlObj = new URL(url, window.location.origin)
  urlObj.searchParams.set('auth', 'manuel-aivortex-2025')
  const secureUrl = urlObj.toString()

  const headers = {
    ...options.headers,
    'authorization': 'manuel-authenticated',
    'x-auth': 'manuel-authenticated'
  }

  console.log('🔒 Cookie-based auth request:', { 
    originalUrl: url,
    secureUrl,
    cookiesSet: document.cookie.includes('manuel-auth-token'),
    headers 
  })

  return fetch(secureUrl, {
    ...options,
    headers,
    credentials: 'include' // Essential for cookies to be sent
  })
}