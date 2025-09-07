import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  isAuthenticated, 
  getUserProfile, 
  logout as authLogout,
  refreshAccessToken,
  getAccessToken 
} from '../services/auth';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const userProfile = await getUserProfile();
          setUser(userProfile);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Try to refresh token
        try {
          await refreshAccessToken();
          const userProfile = await getUserProfile();
          setUser(userProfile);
          setIsLoggedIn(true);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          authLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

