import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token but the page was refreshed, re-fetch
  // /users/me to confirm the token is still valid and the user data is fresh.
  useEffect(() => {
    async function verify() {
      if (token) {
        try {
          const { user: freshUser } = await api.getMe(token);
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch {
          // token expired or invalid - clear everything
          logout();
        }
      }
      setLoading(false);
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async function register(payload) {
    // Registration does not log the user in automatically - per the backend,
    // /auth/register only creates the account. Send them to login after.
    return api.register(payload);
  }

  async function logout() {
    try {
      if (token) await api.logout(token);
    } catch {
      // logout is a no-op server-side anyway; ignore failures here
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
