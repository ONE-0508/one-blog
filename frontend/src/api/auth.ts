import type { LoginRequest, LoginResponse } from '../types/auth'
import { httpClient } from './httpClient'

const loginPath =
  (import.meta.env.VITE_AUTH_LOGIN_PATH as string | undefined) ?? '/auth/login'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await httpClient.post<LoginResponse>(loginPath, payload)
  return response.data
}

