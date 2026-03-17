import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types/api";
import type { AuthTokens } from "../types/auth";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./authStorage";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api/v1";

export const httpClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
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
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status: number | undefined = error.response?.status;

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: unknown) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token as string}`;
            return httpClient(originalRequest);
          })
          .catch((err: Error) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        clearTokens();
        return Promise.reject(
          new Error(error.message || "Authentication failed"),
        );
      }

      try {
        const refreshResponse = await axios.post<ApiResponse<AuthTokens>>(
          `${baseURL}/auth/refresh`,
          {
            refreshToken: refreshTokenValue,
          },
        );
        const tokens = refreshResponse.data.data;

        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        processQueue(null, tokens.accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        return Promise.reject(
          new Error(
            refreshError instanceof Error
              ? refreshError.message
              : "Token refresh failed",
          ),
        );
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      clearTokens();
    }

    return Promise.reject(new Error(error.message || "Request failed"));
  },
);
