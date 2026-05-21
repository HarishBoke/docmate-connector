// Persistent access token (FastAPI backend issues a single 7-day JWT,
// no refresh token). Stored in localStorage so the session survives page
// reloads. Cleared on logout or 401.

const ACCESS_KEY = "ngh.access_token";

const listeners = new Set<() => void>();

function read(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export const tokenStore = {
  getAccessToken: () => read(),
  setAccessToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(ACCESS_KEY, token);
    else window.localStorage.removeItem(ACCESS_KEY);
    listeners.forEach((l) => l());
  },
  // Kept for API compatibility but unused — backend has no refresh token.
  getRefreshToken: (): string | null => null,
  setRefreshToken: (_token: string | null) => {},
  clear() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_KEY);
    }
    listeners.forEach((l) => l());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export { ACCESS_KEY };
