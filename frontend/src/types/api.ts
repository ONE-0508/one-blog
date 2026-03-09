export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
