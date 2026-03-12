import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { clearAccessToken, getAccessToken, getRefreshToken } from './authStorage';
import { refreshToken } from './auth';

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export const httpClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 标记是否正在刷新token
let isRefreshing = false;
// 存储等待token刷新的请求
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (!token) return config;

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status: number | undefined = error.response?.status;

    // 如果是401错误且不是刷新token的请求，尝试刷新token
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: unknown) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token as string}`;
            return httpClient(originalRequest);
          })
          .catch((err: Error) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // 检查是否有refresh token
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        clearAccessToken();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        return Promise.reject(new Error(error.message || 'Authentication failed'));
      }

      try {
        // 尝试刷新token
        const tokens = await refreshToken();

        // 处理等待队列
        processQueue(null, tokens.accessToken);

        // 重试原始请求
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除token并跳转到登录页
        processQueue(refreshError, null);
        clearAccessToken();

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        return Promise.reject(
          new Error(refreshError instanceof Error ? refreshError.message : 'Token refresh failed')
        );
      } finally {
        isRefreshing = false;
      }
    }

    // 其他401错误（如刷新token失败）或非401错误
    if (status === 401) {
      clearAccessToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);
