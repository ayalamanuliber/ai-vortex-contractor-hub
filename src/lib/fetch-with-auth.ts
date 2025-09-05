// Helper to make authenticated requests with debug logging
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const isAuthorized = localStorage.getItem('authorized') === 'true'
  
  if (!isAuthorized) {
    window.location.href = '/simple-login'
    return
  }

  const headers = {
    ...options.headers,
    'authorization': 'authorized'
  }

  // Emergency debugging for production
  console.log('🚨 CLIENT AUTH DEBUG:', {
    url,
    isAuthorized,
    localStorage_authorized: localStorage.getItem('authorized'),
    headers,
    timestamp: new Date().toISOString()
  })

  return fetch(url, {
    ...options,
    headers
  })
}