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
        console.log('Auth state synced - user logged in');
      } catch (error) {
        console.error('Failed to sync auth state:', error);
        // If we can't get user profile, tokens might be invalid
        authLogout();
        setUser(null);
        setIsLoggedIn(false);
      }
    } else if (!authenticated && isLoggedIn) {
      // Tokens are invalid but state says logged in - sync state
      console.log('Tokens invalid, logging out user');
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [isLoggedIn]);

  // Listen for localStorage changes and custom auth events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'refresh_token') {
        console.log('Token storage changed, syncing auth state');
        syncAuthState();
      }
    };

    const handleAuthTokensCleared = (e) => {
      console.log('Auth tokens cleared event received:', e.detail);
      setUser(null);
      setIsLoggedIn(false);
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth events (same tab)
    window.addEventListener('authTokensCleared', handleAuthTokensCleared);
    
    // Also check periodically for changes within the same tab
    const syncInterval = setInterval(syncAuthState, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokensCleared', handleAuthTokensCleared);
      clearInterval(syncInterval);
    };
  }, [syncAuthState]);

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
          console.log('Initial auth check successful');
        } else {
          console.log('No valid tokens found on app load');
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Try to refresh token if we have a refresh token
        if (!isRefreshTokenExpired()) {
          try {
            console.log('Attempting token refresh on app load...');
            await refreshAccessToken();
            const userProfile = await getUserProfile();
            setUser(userProfile);
            setIsLoggedIn(true);
            console.log('Token refresh successful on app load');
          } catch (refreshError) {
            console.error('Token refresh failed on app load:', refreshError);
            authLogout();
            setUser(null);
            setIsLoggedIn(false);
          }
        } else {
          console.log('Refresh token expired, clearing tokens');
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
    console.log('Force syncing auth state...');
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

