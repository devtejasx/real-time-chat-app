import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { authApi, type AuthUser } from "@/services/auth.service";

/** localStorage keys shared with the axios client. */
export const TOKEN_KEY = "rats.jwt";
export const REFRESH_KEY = "rats.refresh";
const USER_KEY = "rats.user";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** True when the user's role is one of the given roles. */
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persist(token: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clear() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await authApi.login(email, password);
    persist(payload.token, payload.refreshToken, payload.user);
    setUser(payload.user);
    return payload.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const payload = await authApi.register(name, email, password);
    persist(payload.token, payload.refreshToken, payload.user);
    setUser(payload.user);
    return payload.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (refreshToken) {
      // Best-effort revoke; clear locally regardless of the result.
      await authApi.logout(refreshToken).catch(() => undefined);
    }
    clear();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: string[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout, hasRole }),
    [user, login, register, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
