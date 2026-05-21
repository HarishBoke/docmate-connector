import { tokenStore } from "./token-store";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Json = Record<string, unknown> | unknown[] | null;

interface RequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: Json | FormData;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  /** When true, do not attempt the 401 → refresh → retry dance. */
  skipRefresh?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const access = data.access_token ?? data.accessToken ?? null;
      const refresh = data.refresh_token ?? data.refreshToken ?? null;
      if (access) tokenStore.setAccessToken(access);
      if (refresh) tokenStore.setRefreshToken(refresh);
      return access;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { body, headers = {}, skipAuth, skipRefresh, ...rest } = opts;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const finalHeaders: Record<string, string> = { ...headers };
  if (!isFormData && body !== undefined) {
    finalHeaders["Content-Type"] ??= "application/json";
  }
  if (!skipAuth) {
    const token = tokenStore.getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const doFetch = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      credentials: "include",
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      finalHeaders["Authorization"] = `Bearer ${newToken}`;
      res = await doFetch();
    } else {
      tokenStore.clear();
    }
  }

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }
    const msg =
      (data as any)?.detail ||
      (data as any)?.message ||
      res.statusText ||
      "Request failed";
    throw new ApiError(res.status, msg, data);
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export { API_BASE_URL };
