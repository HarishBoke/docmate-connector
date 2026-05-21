import { tokenStore } from "./token-store";

// FastAPI backend base URL. Defaults to the predicted Render service URL —
// override via VITE_API_BASE_URL once the actual deployment URL is known.
// All endpoints are mounted under /api/v1, so we append that prefix here.
const RAW_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ??
  "https://health-doc-cms-api.onrender.com";

const API_BASE_URL = `${String(RAW_BASE).replace(/\/+$/, "")}/api/v1`;

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
  /** When true, parse response as text instead of JSON. */
  asText?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { body, headers = {}, skipAuth, asText, ...rest } = opts;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const finalHeaders: Record<string, string> = { ...headers };
  if (!isFormData && body !== undefined) {
    finalHeaders["Content-Type"] ??= "application/json";
  }
  if (!skipAuth) {
    const token = tokenStore.getAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  });

  if (res.status === 401 && !skipAuth) {
    // Backend has no refresh endpoint; drop the stale token.
    tokenStore.clear();
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
    throw new ApiError(res.status, typeof msg === "string" ? msg : "Request failed", data);
  }

  if (res.status === 204) return undefined as T;
  if (asText) return (await res.text()) as unknown as T;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export { API_BASE_URL };
