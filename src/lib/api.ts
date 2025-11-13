// src/lib/api.ts
// Centralized API helpers and base URL
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL || ''

// ────────────────────────────────────────────────────────────
// Token helpers (optional but handy)
export const TOKEN_KEY = 'accessToken'
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}
export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}
export function clearAccessToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}
// ────────────────────────────────────────────────────────────

function buildUrl(pathOrUrl: string) {
  return pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${API_BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

function authHeader(): Record<string, string> {
  const token = getAccessToken()
  const h: Record<string, string> = {}
  if (token) h.Authorization = `Bearer ${token}`
  return h
}
export const apiPost = async (
  pathOrUrl: string,
  payload?: any,
): Promise<{ data: any }> => {
  const url = buildUrl(pathOrUrl)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...authHeader(),
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  const data = await res.json()
  return { data }
}

export const apiGet = async (
  pathOrUrl: string,
  options?: {
    returnHeaders?: boolean
    extraHeaders?: Record<string, string>
  },
): Promise<
  | { data: any }
  | { data: any; headers: Record<string, string>; status?: number }
> => {
  const url = buildUrl(pathOrUrl)
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...authHeader(),
    ...(options?.extraHeaders || {}),
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (options?.returnHeaders) {
    // 304 Not Modified는 호출 측에서 처리하도록 예외로 던지지 않음
    if (res.status === 304) {
      const headerObj: Record<string, string> = {}
      res.headers.forEach((v, k) => (headerObj[k.toLowerCase()] = v))
      return { data: null, status: 304, headers: headerObj }
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const headerObj: Record<string, string> = {}
    res.headers.forEach((v, k) => (headerObj[k.toLowerCase()] = v))
    return { data, headers: headerObj }
  }

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  const data = await res.json()
  return { data }
}

// ✅ 추가: PUT 래퍼 (204 대응 포함)
export const apiPut = async (
  pathOrUrl: string,
  payload?: any,
): Promise<{ data: any }> => {
  const url = buildUrl(pathOrUrl)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...authHeader(),
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  })

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  let data: any = null
  if (res.status !== 204) {
    try {
      data = await res.json()
    } catch {
      data = null
    }
  }
  return { data }
}

// ✅ 추가: 로그아웃 헬퍼
export function logout(redirectTo?: string) {
  clearAccessToken()
  if (typeof window !== 'undefined' && redirectTo) {
    window.location.href = redirectTo
  }
}
