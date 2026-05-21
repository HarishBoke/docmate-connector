import { apiRequest } from "./api-client";

export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  token_type?: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: { email, password },
    }),
  signup: (email: string, password: string) =>
    apiRequest<AuthSession>("/auth/signup", {
      method: "POST",
      skipAuth: true,
      body: { email, password },
    }),
  me: () => apiRequest<User>("/auth/me"),
};
