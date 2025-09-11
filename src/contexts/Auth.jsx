import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  isAuthenticated, 
  getUserProfile, 
  logout as authLogout,
  refreshAccessToken,
  getAccessToken,
  isTokenExpiringSoon,
  getTokenExpirationTime,
  isAccessTokenExpired,
  isRefreshTokenExpired
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

  // Proactive token refresh function
  const handleProactiveRefresh = useCallback(async () => {
    if (isTokenExpiringSoon() && isAuthenticated()) {
      try {
        console.log('Token expiring soon, refreshing proactively...');
        
        // Check if refresh token is still valid before attempting refresh
        if (isRefreshTokenExpired()) {
          console.log('Refresh token expired, logging out user');
          authLogout();
          setUser(null);
          setIsLoggedIn(false);
          return;
        }
        
        await refreshAccessToken();
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        // If proactive refresh fails, clear tokens and logout
        authLogout();
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  // Set up interval for proactive token refresh
  useEffect(() => {
    if (isLoggedIn) {
      // Check every hour for token expiration (since tokens last 7 days)
      const interval = setInterval(handleProactiveRefresh, 60 * 60 * 1000);
      
      // Also check immediately
      handleProactiveRefresh();
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, handleProactiveRefresh]);

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

