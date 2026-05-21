import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type Role, type User } from "./auth-api";
import { tokenStore } from "./token-store";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
      tokenStore.clear();
    }
  }, []);

  useEffect(() => {
    // Bootstrap session: if we have a refresh token, try to hydrate the user.
    (async () => {
      const refresh = tokenStore.getRefreshToken();
      if (!refresh && !tokenStore.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      await fetchMe();
      setIsLoading(false);
    })();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      tokenStore.setAccessToken(res.access_token);
      if (res.refresh_token) tokenStore.setRefreshToken(res.refresh_token);
      if (res.user) setUser(res.user);
      else await fetchMe();
    },
    [fetchMe],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    tokenStore.clear();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role: Role | Role[]) => {
      if (!user) return false;
      const wanted = Array.isArray(role) ? role : [role];
      return wanted.some((r) => user.roles?.includes(r));
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
      refresh: fetchMe,
    }),
    [user, isLoading, login, logout, hasRole, fetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
