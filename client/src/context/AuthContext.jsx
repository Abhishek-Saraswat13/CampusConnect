import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is stored, verify it's still valid by
  // fetching the current user. Prevents the app from trusting a stale or
  // tampered localStorage value without the backend confirming it.
  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .fetchMe()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem('cc_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await authService.login(email, password);
    localStorage.setItem('cc_token', token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const registerAccount = useCallback(async (name, email, password) => {
    const { token, user: newUser } = await authService.register(name, email, password);
    localStorage.setItem('cc_token', token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cc_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, registerAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
