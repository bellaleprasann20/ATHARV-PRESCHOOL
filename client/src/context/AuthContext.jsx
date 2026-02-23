import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, getMe } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage, then verify token with server
  useEffect(() => {
    const token      = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    // Optimistically restore user so UI isn't blank
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      // corrupted JSON — clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }

    // Verify token is still valid in background
    getMe()
      .then(res => {
        const fresh = res.data?.data;
        if (fresh) {
          setUser(fresh);
          localStorage.setItem('user', JSON.stringify(fresh));
        }
      })
      .catch(() => {
        // Token expired or invalid — silent logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password });

    // Server response: { success, message, data: { _id, name, email, role, token, ... } }
    const payload = res.data?.data;
    if (!payload?.token) throw new Error('Invalid response from server.');

    const { token, ...userData } = payload;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    toast.success(`Welcome back, ${userData.name}! 👋`);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin:   user?.role === 'admin',
      isParent:  user?.role === 'parent',
      isTeacher: user?.role === 'teacher',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};