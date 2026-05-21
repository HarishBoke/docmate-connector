// In-memory access token + localStorage refresh token.
// NOTE: If the FastAPI backend issues the refresh token as an httpOnly cookie,
// switch `getRefreshToken`/`setRefreshToken` to no-ops and let the browser carry it.

const ACCESS_KEY = "__access_token__"; // not persisted — in-memory only
const REFRESH_STORAGE_KEY = "ngh.refresh_token";

let accessToken: string | null = null;
const listeners = new Set<() => void>();

export const tokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken(token: string | null) {
    accessToken = token;
    listeners.forEach((l) => l());
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_STORAGE_KEY);
  },
  setRefreshToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(REFRESH_STORAGE_KEY, token);
    else window.localStorage.removeItem(REFRESH_STORAGE_KEY);
  },
  clear() {
    accessToken = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(REFRESH_STORAGE_KEY);
    }
    listeners.forEach((l) => l());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export { ACCESS_KEY };
