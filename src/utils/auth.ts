// Utilities for decoding JWT and extracting role information
export function decodeJwt(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]

    // Base64url -> Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding
    const pad = base64.length % 4
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64

    let jsonStr: string
    if (typeof window !== 'undefined' && typeof atob === 'function') {
      const binary = atob(padded)
      if (typeof TextDecoder !== 'undefined') {
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
        jsonStr = new TextDecoder().decode(bytes)
      } else {
        // Fallback for very old environments: percent-encode bytes then decode
        jsonStr = decodeURIComponent(
          binary
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
        )
      }
    } else if (typeof Buffer !== 'undefined') {
      // Server-side / Node
      jsonStr = Buffer.from(padded, 'base64').toString('utf8')
    } else {
      // Last-resort: try atob if present
      const binary = typeof atob === 'function' ? atob(padded) : ''
      jsonStr = binary
    }

    return JSON.parse(jsonStr)
  } catch (e) {
    return null
  }
}

export function getRoleFromToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = window.localStorage.getItem('accessToken')
  if (!token) return window.localStorage.getItem('role') || null
  const decoded = decodeJwt(token)
  return decoded?.role ?? window.localStorage.getItem('role') ?? null
}

export function getNameFromToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = window.localStorage.getItem('accessToken')
  if (token) {
    const decoded = decodeJwt(token)
    if (decoded?.name) return decoded.name
  }
  // fall back to session storage user info
  const user = sessionStorage.getItem('loggedInUser')
  if (user) {
    try {
      const parsed = JSON.parse(user)
      if (parsed?.name) return parsed.name
    } catch (e) {
      // ignore
    }
  }
  const admin = sessionStorage.getItem('loggedInAdmin')
  if (admin) {
    try {
      const parsed = JSON.parse(admin)
      if (parsed?.name) return parsed.name
    } catch (e) {
      // ignore
    }
  }
  return null
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('tokenType')
  window.localStorage.removeItem('refreshToken')
  window.localStorage.removeItem('role')
}
