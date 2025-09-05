// Helper to make authenticated requests with multiple auth methods
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const isAuthorized = localStorage.getItem('authorized') === 'true'
  
  if (!isAuthorized) {
    window.location.href = '/simple-login'
    return
  }

  // Add auth token to URL (guaranteed to work in Vercel)
  const urlObj = new URL(url, window.location.origin)
  urlObj.searchParams.set('auth', 'manuel-aivortex-2025')
  const secureUrl = urlObj.toString()

  // Also send in headers as backup
  const headers = {
    ...options.headers,
    'authorization': 'manuel-authenticated',
    'x-auth': 'manuel-authenticated'
  }

  console.log('🔒 Secure auth request:', { url: secureUrl })

  return fetch(secureUrl, {
    ...options,
    headers
  })
}