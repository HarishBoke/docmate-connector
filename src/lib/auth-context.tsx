import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type User } from "./auth-api";
import { tokenStore } from "./token-store";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
    (async () => {
      if (!tokenStore.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      await fetchMe();
      setIsLoading(false);
    })();
  }, [fetchMe]);

  const applySession = useCallback(
    (res: { access_token: string; user: User }) => {
      tokenStore.setAccessToken(res.access_token);
      setUser(res.user);
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      applySession(res);
    },
    [applySession],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.signup(email, password);
      applySession(res);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      refresh: fetchMe,
    }),
    [user, isLoading, login, signup, logout, fetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
