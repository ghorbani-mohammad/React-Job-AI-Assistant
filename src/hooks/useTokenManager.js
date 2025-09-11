import { useCallback } from 'react';
import { 
  getAccessToken, 
  getRefreshToken, 
  refreshAccessToken, 
  isAuthenticated, 
  isTokenExpiringSoon,
  getTokenExpirationTime 
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

  return {
    getToken,
    getRefreshToken: getRefreshTokenValue,
    refreshToken,
    isAuthenticated: checkAuthentication,
    isTokenExpiringSoon: checkTokenExpiration,
    getTokenExpirationTime: getExpirationTime,
  };
};
