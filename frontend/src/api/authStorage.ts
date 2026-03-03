const TOKEN_KEY = 'one-blog:auth-token:v1'

let cachedToken: string | null | undefined

export function getAccessToken(): string | null {
  if (cachedToken !== undefined) return cachedToken

  if (typeof window === 'undefined') {
    cachedToken = null
    return null
  }

  try {
    cachedToken = window.localStorage.getItem(TOKEN_KEY)
    return cachedToken
  } catch {
    cachedToken = null
    return null
  }
}

export function setAccessToken(token: string): void {
  cachedToken = token

  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export function clearAccessToken(): void {
  cachedToken = null

  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

