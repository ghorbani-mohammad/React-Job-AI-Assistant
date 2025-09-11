import { useCallback } from 'react';
import { 
  getAccessToken, 
  getRefreshToken, 
  refreshAccessToken, 
  isAuthenticated, 
  isTokenExpiringSoon,
  getTokenExpirationTime,
  isAccessTokenExpired,
  isRefreshTokenExpired
} from '../services/auth';

export const useTokenManager = () => {
  const getToken = useCallback(() => {
    return getAccessToken();
  }, []);

  const getRefreshTokenValue = useCallback(() => {
    return getRefreshToken();
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      await refreshAccessToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  const checkAuthentication = useCallback(() => {
    return isAuthenticated();
  }, []);

  const checkTokenExpiration = useCallback(() => {
    return isTokenExpiringSoon();
  }, []);

  const getExpirationTime = useCallback(() => {
    return getTokenExpirationTime();
  }, []);

  const checkAccessTokenExpired = useCallback(() => {
    return isAccessTokenExpired();
  }, []);

  const checkRefreshTokenExpired = useCallback(() => {
    return isRefreshTokenExpired();
  }, []);

  return {
    getToken,
    getRefreshToken: getRefreshTokenValue,
    refreshToken,
    isAuthenticated: checkAuthentication,
    isTokenExpiringSoon: checkTokenExpiration,
    getTokenExpirationTime: getExpirationTime,
    isAccessTokenExpired: checkAccessTokenExpired,
    isRefreshTokenExpired: checkRefreshTokenExpired,
  };
};
