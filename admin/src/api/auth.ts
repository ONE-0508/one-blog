import type { LoginResponse } from "../types/auth";
import { httpClient } from "./httpClient";

export const login = async (payload: {
  username?: string;
  email?: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await httpClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
};
