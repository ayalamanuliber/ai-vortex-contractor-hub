// Helper to make authenticated requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const isAuthorized = localStorage.getItem('authorized') === 'true'
  
  if (!isAuthorized) {
    window.location.href = '/simple-login'
    return
  }

  const headers = {
    ...options.headers,
    'Authorization': 'authorized'
  }

  return fetch(url, {
    ...options,
    headers
  })
}