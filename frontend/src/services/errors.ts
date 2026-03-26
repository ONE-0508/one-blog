import axios, { type AxiosError } from 'axios';

import type { ApiError } from '../types/api';

function getStatus(error: AxiosError): number | undefined {
  const status = error.response?.status;
  return typeof status === 'number' ? status : undefined;
}

function extractResponseMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const maybeRootMessage = (data as { message?: unknown }).message;
  if (typeof maybeRootMessage === 'string' && maybeRootMessage.trim()) {
    return maybeRootMessage;
  }

  const maybeError = (data as { error?: unknown }).error;
  if (maybeError && typeof maybeError === 'object') {
    const maybeNestedMessage = (maybeError as { message?: unknown }).message;
    if (typeof maybeNestedMessage === 'string' && maybeNestedMessage.trim()) {
      return maybeNestedMessage;
    }
  }

  return null;
}

export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      message: error instanceof Error ? error.message : '未知错误',
    };
  }

  const status = getStatus(error);
  const message = extractResponseMessage(error.response?.data) || error.message || '请求失败';

  return {
    message,
    status,
  };
}
