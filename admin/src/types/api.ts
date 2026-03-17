export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: number;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}
