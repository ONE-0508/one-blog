import axios, { type AxiosError } from 'axios';

import type { ApiError } from '../types/api';

function getStatus(error: AxiosError): number | undefined {
  const status = error.response?.status;
  return typeof status === 'number' ? status : undefined;
}

export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      message: error instanceof Error ? error.message : '未知错误',
    };
  }

  const status = getStatus(error);
  const message =
    (typeof error.response?.data === 'object' &&
      error.response?.data !== null &&
      'message' in error.response.data &&
      typeof (error.response.data as { message?: unknown }).message === 'string' &&
      (error.response.data as { message: string }).message) ||
    error.message ||
    '请求失败';

  return {
    message,
    status,
  };
}
