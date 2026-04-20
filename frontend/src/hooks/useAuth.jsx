import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  const fetchMe = useCallback(async (t) => {
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(data.data);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe(token);
  }, [token, fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const t = data.data.token;
    localStorage.setItem('token', t);
    setToken(t);
    await fetchMe(t);
    return data.data.user;
  };

  const register = async (body) => {
    const { data } = await api.post('/auth/register', body);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshUser: () => fetchMe(token),
    }),
    [token, user, loading, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export { getErrorMessage };
