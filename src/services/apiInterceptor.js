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
        console.log('Access token expired, attempting refresh...');
        
        // Step 2: Check if refresh token is also expired
        if (isRefreshTokenExpired()) {
          console.log('Refresh token also expired, requiring re-authentication');
          clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        
        // Step 3: Try to refresh access token
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }
        
        try {
          await refreshPromise;
          console.log('Access token refreshed successfully');
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed. Please log in again.');
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }

      // Step 4: Make the request with current/refreshed access token
      const token = getAccessToken();
      let response = await makeRequest(token);
      
      // Step 5: If we still get 401, the refresh token might be invalid
      if (response.status === 401) {
        console.log('401 response after token refresh, refresh token invalid');
        clearTokens();
        window.location.href = '/login';
        throw new Error('Authentication failed. Please log in again.');
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
