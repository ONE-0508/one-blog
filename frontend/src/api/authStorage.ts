const ACCESS_TOKEN_KEY = 'one-blog:access-token:v1';
const REFRESH_TOKEN_KEY = 'one-blog:refresh-token:v1';

let cachedAccessToken: string | null | undefined;
let cachedRefreshToken: string | null | undefined;

// Access Token 相关函数
export function getAccessToken(): string | null {
  if (cachedAccessToken !== undefined) return cachedAccessToken;

  if (typeof window === 'undefined') {
    cachedAccessToken = null;
    return null;
  }

  try {
    cachedAccessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    return cachedAccessToken;
  } catch {
    cachedAccessToken = null;
    return null;
  }
}

export function setAccessToken(token: string): void {
  cachedAccessToken = token;

  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

// Refresh Token 相关函数
export function getRefreshToken(): string | null {
  if (cachedRefreshToken !== undefined) return cachedRefreshToken;

  if (typeof window === 'undefined') {
    cachedRefreshToken = null;
    return null;
  }

  try {
    cachedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    return cachedRefreshToken;
  } catch {
    cachedRefreshToken = null;
    return null;
  }
}

export function setRefreshToken(token: string): void {
  cachedRefreshToken = token;

  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

// 清除所有令牌
export function clearTokens(): void {
  cachedAccessToken = null;
  cachedRefreshToken = null;

  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

// 向后兼容
export function clearAccessToken(): void {
  clearTokens();
}
