import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { TokenResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEY = "aura_access_token";
const REFRESH_TOKEN_KEY = "aura_refresh_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  getAccessToken: () => (isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null),
  getRefreshToken: () => (isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setTokens: (tokens: TokenResponse) => {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  setAccessToken: (accessToken: string) => {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },
  clear: () => {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await axios.post<{ access_token: string }>(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });
  tokenStorage.setAccessToken(response.data.access_token);
  return response.data.access_token;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch {
        tokenStorage.clear();
        if (isBrowser()) window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
