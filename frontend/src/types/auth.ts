export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: UserProfile;
    tokens: AuthTokens;
  };
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: UserProfile;
    tokens: AuthTokens;
  };
}

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
