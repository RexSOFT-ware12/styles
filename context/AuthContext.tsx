"use client";

import { AuthUser, fetchMe, signin as apiSignin, signup as apiSignup } from "@/lib/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
    const { token, user } = await apiSignup(name, email, password);
    localStorage.setItem(STORAGE_KEY, token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
