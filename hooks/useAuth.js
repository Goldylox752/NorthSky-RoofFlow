"use client";

import { useEffect, useState, useCallback } from "react";
import * as authAPI from "@/lib/api/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load current user
  const loadUser = useCallback(async () => {
    try {
      setError(null);

      const res = await authAPI.getMe();
      setUser(res && res.user ? res.user : null);
    } catch (err) {
      setUser(null);
      setError(err?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(
    async (email, password) => {
      try {
        setError(null);

        const res = await authAPI.login({ email, password });

        await loadUser();

        return {
          success: true,
          data: res,
        };
      } catch (err) {
        const msg = err?.message || "Login failed";
        setError(msg);

        return {
          success: false,
          error: msg,
        };
      }
    },
    [loadUser]
  );

  // Signup
  const signup = useCallback(
    async (email, password, name) => {
      try {
        setError(null);

        const res = await authAPI.signup({
          email,
          password,
          name,
        });

        await loadUser();

        return {
          success: true,
          data: res,
        };
      } catch (err) {
        const msg = err?.message || "Signup failed";
        setError(msg);

        return {
          success: false,
          error: msg,
        };
      }
    },
    [loadUser]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();

      setUser(null);
      setError(null);
    } catch (err) {
      setError(err?.message || "Logout failed");
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,

    login,
    signup,
    logout,
    refresh: loadUser,
  };
}