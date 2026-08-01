import { apiClient, tokenStorage } from "./client";
import type { TokenResponse, User } from "../types/api";

export async function register(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", { email, password });
  return data;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", { email, password });
  tokenStorage.setTokens(data);
  return getMe();
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (refreshToken) {
    try {
      await apiClient.post("/auth/logout", { refresh_token: refreshToken });
    } catch {
      // Best-effort server-side revocation; always clear local tokens regardless.
    }
  }
  tokenStorage.clear();
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post("/auth/password-reset/request", { email });
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/password-reset/confirm", { token, new_password: newPassword });
}
