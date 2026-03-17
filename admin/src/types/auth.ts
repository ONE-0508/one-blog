export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  success: boolean;
  data: {
    tokens: AuthTokens;
  };
  error?: {
    message: string;
  };
}
