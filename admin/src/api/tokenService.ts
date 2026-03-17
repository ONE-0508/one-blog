import type { ApiResponse } from "../types/api";
import type { AuthTokens } from "../types/auth";
import { httpClient } from "./httpClient";

export const refreshToken = async (
  refreshTokenValue: string,
): Promise<AuthTokens> => {
  const response = await httpClient.post<ApiResponse<AuthTokens>>(
    "/auth/refresh",
    {
      refreshToken: refreshTokenValue,
    },
  );

  return response.data.data;
};
