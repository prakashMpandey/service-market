import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore state on mount using stored tokens
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Listen for forced logout events from axios interceptor
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForcedLogout);
    };
  }, []);

  async function login(username, password) {
    const { data } = await client.post('/users/login/', { username, password });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    // JWT uses base64url: replace - and _ before calling atob
    const base64Url = data.access.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const userData = { username: payload.username, role: payload.role, id: payload.user_id };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }

  async function logout() {
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) await client.post('/users/logout/', { refresh });
    } catch { /* ignore */ }
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  }

  async function signup(formData) {
    const { data } = await client.post('/users/signup/', formData);
    return data;
  }

  const isProvider = user?.role === 'provider';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isProvider, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
