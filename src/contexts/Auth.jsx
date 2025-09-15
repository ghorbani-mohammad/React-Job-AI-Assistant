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

  // Check authentication state and sync with localStorage
  const syncAuthState = useCallback(async () => {
    const authenticated = isAuthenticated();
    
    if (authenticated && !isLoggedIn) {
      // User has valid tokens but state says not logged in - sync state
      try {
        const userProfile = await getUserProfile();
        setUser(userProfile);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to sync auth state:', error);
        // If sync fails, don't clear tokens immediately
        // The API interceptor will handle 401s and clear tokens appropriately
        // We don't need to be aggressive here since 401s are handled elsewhere
      }
    } else if (!authenticated && isLoggedIn) {
      // Tokens are invalid but state says logged in - sync state
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [isLoggedIn]);

  // Listen for localStorage changes and custom auth events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'refresh_token') {
        syncAuthState(); // Respond to storage changes immediately
      }
    };

    const handleAuthTokensCleared = (e) => {
      setUser(null);
      setIsLoggedIn(false);
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth events (same tab) - this handles 401 responses
    window.addEventListener('authTokensCleared', handleAuthTokensCleared);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokensCleared', handleAuthTokensCleared);
    };
  }, [syncAuthState]);

  // Proactive token refresh function
  const handleProactiveRefresh = useCallback(async () => {
    if (isTokenExpiringSoon() && isAuthenticated()) {
      try {
        // Check if refresh token is still valid before attempting refresh
        if (isRefreshTokenExpired()) {
          authLogout();
          setUser(null);
          setIsLoggedIn(false);
          return;
        }
        
        await refreshAccessToken();
      } catch (error) {
        console.error('Proactive token refresh failed:', error);
        // Only clear tokens if refresh token is also expired
        // Don't be too aggressive - let the API interceptor handle 401s
        if (isRefreshTokenExpired()) {
          authLogout();
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    }
  }, []);

  // Set up interval for proactive token refresh
  useEffect(() => {
    if (isLoggedIn) {
      // Check every 2 minutes for token expiration (since tokens last only 5 minutes)
      const interval = setInterval(handleProactiveRefresh, 2 * 60 * 1000);
      
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
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Try to refresh token if we have a refresh token
        if (!isRefreshTokenExpired()) {
          try {
            await refreshAccessToken();
            const userProfile = await getUserProfile();
            setUser(userProfile);
            setIsLoggedIn(true);
          } catch (refreshError) {
            console.error('Token refresh failed on app load:', refreshError);
            // Only clear tokens if refresh token is also expired
            if (isRefreshTokenExpired()) {
              authLogout();
              setUser(null);
              setIsLoggedIn(false);
            } else {
              // If refresh token is still valid, just set logged out state
              // Let the API interceptor handle future 401s
              setUser(null);
              setIsLoggedIn(false);
            }
          }
        } else {
          authLogout();
          setUser(null);
          setIsLoggedIn(false);
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

  // Force sync auth state (useful for debugging or manual refresh)
  const forceSync = useCallback(() => {
    syncAuthState();
  }, [syncAuthState]);

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    updateUser,
    forceSync,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

