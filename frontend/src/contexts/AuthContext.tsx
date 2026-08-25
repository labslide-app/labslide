import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import apiClient from "../api/client";

const TOKEN_KEY = "access_token";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  group_id: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    full_name: string,
    invite_code: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时校验登录状态（Bearer token + Cookie 双通道）
  useEffect(() => {
    apiClient
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    const token = response.data?.access_token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    setUser(response.data.user);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      full_name: string,
      invite_code: string
    ) => {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
        full_name,
        invite_code: invite_code || "",
      });
      const token = response.data?.access_token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
      setUser(response.data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}