import { 
  getAccessToken, 
  refreshAccessToken, 
  clearTokens, 
  isAccessTokenExpired, 
  isRefreshTokenExpired 
} from './auth';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

// Check if the endpoint requires authentication
const requiresAuth = (url) => {
  const authEndpoints = [
    '/user/profile/',
    '/user/profile/detail/',
    '/linkedin/favorites/',
    '/user/auth/refresh/'
  ];
  
  return authEndpoints.some(endpoint => url.includes(endpoint));
};

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
    // Check if this endpoint requires authentication
    const needsAuth = requiresAuth(url);
    
    if (needsAuth) {
      // Step 1: Check if access token is expired before making request
      if (isAccessTokenExpired()) {
        
        // Step 2: Check if refresh token is also expired
        if (isRefreshTokenExpired()) {
          clearTokens();
          throw new Error('Session expired. Please log in again.');
        }
        
        // Step 3: Try to refresh access token
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }
        
        try {
          await refreshPromise;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Only clear tokens if refresh token is also expired
          if (isRefreshTokenExpired()) {
            clearTokens();
            throw new Error('Session expired. Please log in again.');
          } else {
            // If refresh token is still valid, don't clear tokens
            // The user might have network issues or temporary server problems
            throw new Error('Authentication failed. Please try again.');
          }
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }

      // Step 4: Make the request with current/refreshed access token
      const token = getAccessToken();
      let response = await makeRequest(token);
      
      // Step 5: If we still get 401, check if refresh token is expired
      if (response.status === 401) {
        // Only clear tokens if refresh token is also expired
        if (isRefreshTokenExpired()) {
          clearTokens();
          throw new Error('Session expired. Please log in again.');
        } else {
          // If refresh token is still valid, don't clear tokens
          // This might be a temporary server issue
          throw new Error('Authentication failed. Please try again.');
        }
      }
      
      return response;
    } else {
      // For public endpoints, just make the request without token logic
      const token = getAccessToken(); // Include token if available, but don't require it
      return await makeRequest(token);
    }
  } catch (error) {
    // If it's a network error or other issue, just throw it
    throw error;
  }
};
