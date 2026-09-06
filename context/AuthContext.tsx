"use client";

import { AuthUser, fetchMe, googleAuth as apiGoogleAuth, signin as apiSignin, signup as apiSignup } from "@/lib/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Returns whether this call just created the account, so callers (the
  // signup page) know to route to /welcome instead of straight in.
  register: (name: string, email: string, password: string) => Promise<{ isNewUser: boolean }>;
  // Signs in (or, on first use, silently signs up) with a Google Identity
  // Services ID token. Same underlying call either way — see lib/auth.ts.
  // Also returns isNewUser for the same reason as register() above.
  loginWithGoogle: (credential: string) => Promise<{ isNewUser: boolean }>;
  logout: () => void;
  // Re-fetches /auth/me and updates the cached user — call after an
  // account-details edit (e.g. name change) so the header/account pages
  // reflect it without requiring a full sign-out/sign-in.
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const STORAGE_KEY = "fabricnow_token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }
    fetchMe(saved)
      .then(({ user }) => {
        setToken(saved);
        setUser(user);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await apiSignin(email, password);
    localStorage.setItem(STORAGE_KEY, token);
    setToken(token);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { token, user, isNewUser } = await apiSignup(name, email, password);
    localStorage.setItem(STORAGE_KEY, token);
    setToken(token);
    setUser(user);
    return { isNewUser: isNewUser ?? true };
  };

  const loginWithGoogle = async (credential: string) => {
    const { token, user, isNewUser } = await apiGoogleAuth(credential);
    localStorage.setItem(STORAGE_KEY, token);
    setToken(token);
    setUser(user);
    return { isNewUser: isNewUser ?? false };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    const { user } = await fetchMe(token);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
