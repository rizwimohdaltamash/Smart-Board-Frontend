import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, getToken, getUser } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getToken();
    const savedUser = getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
      // Optionally verify token with backend
      authAPI.getMe()
        .then(data => setUser(data))
        .catch(() => authAPI.logout());
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);
    setUser({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    setUser({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
