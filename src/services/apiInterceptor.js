import { getAccessToken, refreshAccessToken, clearTokens } from './auth';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

// API interceptor that handles token refresh automatically
export const apiRequest = async (url, options = {}) => {
  const makeRequest = async (token) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
      ...options,
      headers,
    });
  };

  try {
    // First attempt with current token
    const token = getAccessToken();
    let response = await makeRequest(token);
    
    // If we get 401 and have a refresh token, try to refresh
    if (response.status === 401 && getAccessToken()) {
      // Prevent multiple simultaneous refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }
      
      try {
        await refreshPromise;
        // Retry the original request with new token
        const newToken = getAccessToken();
        response = await makeRequest(newToken);
        
        // If still 401 after refresh, the refresh token is invalid
        if (response.status === 401) {
          clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed. Please log in again.');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        clearTokens();
        window.location.href = '/login';
        throw new Error('Authentication failed. Please log in again.');
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }
    
    return response;
  } catch (error) {
    // If it's a network error or other issue, just throw it
    throw error;
  }
};
