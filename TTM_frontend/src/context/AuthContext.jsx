import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ttm_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('ttm_token');
          localStorage.removeItem('ttm_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('ttm_token', newToken);
    localStorage.setItem('ttm_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('ttm_token', newToken);
    localStorage.setItem('ttm_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
