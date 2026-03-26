import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthTokens,
  UserProfile,
  ApiResponse,
} from '../types/auth';
import { httpClient } from './httpClient';
import { setAccessToken, setRefreshToken, getRefreshToken, clearTokens } from './authStorage';

const loginPath = (import.meta.env.VITE_AUTH_LOGIN_PATH as string | undefined) || '/auth/login';
const registerPath =
  (import.meta.env.VITE_AUTH_REGISTER_PATH as string | undefined) || '/auth/register';
const refreshPath =
  (import.meta.env.VITE_AUTH_REFRESH_PATH as string | undefined) || '/auth/refresh';
const mePath = (import.meta.env.VITE_AUTH_ME_PATH as string | undefined) || '/auth/me';
const validatePath =
  (import.meta.env.VITE_AUTH_VALIDATE_PATH as string | undefined) || '/auth/validate';

/**
 * 用户登录
 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await httpClient.post<LoginResponse>(loginPath, payload);

  // 保存令牌
  if (response.data.data?.tokens) {
    const { accessToken, refreshToken } = response.data.data.tokens;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }

  return response.data;
}

/**
 * 用户注册
 */
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await httpClient.post<RegisterResponse>(registerPath, payload);

  // 保存令牌
  if (response.data.data?.tokens) {
    const { accessToken, refreshToken } = response.data.data.tokens;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }

  return response.data;
}

/**
 * 刷新访问令牌
 */
export async function refreshToken(): Promise<AuthTokens> {
  const refreshTokenValue = getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const response = await httpClient.post<ApiResponse<AuthTokens>>(refreshPath, {
    refreshToken: refreshTokenValue,
  });

  // 保存新的令牌
  if (response.data.data) {
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    setAccessToken(accessToken);
    setRefreshToken(newRefreshToken);
  }

  return response.data.data;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<ApiResponse<{ user: UserProfile }>> {
  const response = await httpClient.get<ApiResponse<{ user: UserProfile }>>(mePath);
  return response.data;
}

/**
 * 验证令牌有效性
 */
export async function validateToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  role?: string;
  expiresAt?: number;
  error?: string;
}> {
  try {
    const response = await httpClient.post<
      ApiResponse<{
        valid: boolean;
        userId?: string;
        role?: string;
        expiresAt?: number;
        error?: string;
      }>
    >(validatePath, { token });

    return response.data.data;
  } catch {
    return { valid: false };
  }
}

/**
 * 修改密码
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> {
  const response = await httpClient.put<ApiResponse<{ message: string }>>('/auth/password', {
    currentPassword,
    newPassword,
  });
  return response.data;
}

/**
 * 用户登出
 */
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await httpClient.post<ApiResponse<{ message: string }>>('/auth/logout');
    // 清除本地令牌
    clearTokens();
    return response.data;
  } catch (error) {
    // 即使API调用失败，也清除本地令牌
    clearTokens();
    throw error;
  }
}
