import { apiRequest } from "./api-client";

export type Role = "author" | "reviewer" | "approver" | "admin" | string;

export interface User {
  id: string;
  email: string;
  full_name?: string;
  roles: Role[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user?: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: { email, password },
    }),
  me: () => apiRequest<User>("/auth/me"),
  logout: () =>
    apiRequest<void>("/auth/logout", { method: "POST" }).catch(() => undefined),
  forgotPassword: (email: string) =>
    apiRequest<void>("/auth/forgot-password", {
      method: "POST",
      skipAuth: true,
      body: { email },
    }),
};
