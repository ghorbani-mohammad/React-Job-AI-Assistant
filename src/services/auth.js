import { apiRequest } from './apiInterceptor';

const BASE_URL = 'https://social.m-gh.com/api/v1/user/auth/';

// Token management
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Request verification code
export const requestVerificationCode = async (email) => {
  const response = await fetch(`${BASE_URL}request-verification/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send verification code');
  }
  
  return data;
};

// Verify email code and get JWT tokens
export const verifyEmailCode = async (email, code) => {
  const response = await fetch(`${BASE_URL}verify-email/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify code');
  }
  
  // Store tokens
  setTokens(data.tokens.access, data.tokens.refresh);
  
  return data;
};

// Register user with additional information
export const registerUser = async (email, firstName, lastName, verificationCode) => {
  const response = await fetch(`${BASE_URL}register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      verification_code: verificationCode,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to register user');
  }
  
  // Store tokens
  setTokens(data.tokens.access, data.tokens.refresh);
  
  return data;
};

// Get user profile
export const getUserProfile = async () => {
  const response = await apiRequest('https://social.m-gh.com/api/v1/user/profile/');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user profile');
  }
  
  return data;
};

// Get/Update profile detail
export const getProfileDetail = async () => {
  const response = await apiRequest('https://social.m-gh.com/api/v1/user/profile/detail/');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get profile detail');
  }
  
  return data;
};

export const updateProfileDetail = async (profileData) => {
  const response = await apiRequest('https://social.m-gh.com/api/v1/user/profile/detail/', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  
  return data;
};

export const patchProfileDetail = async (profileData) => {
  const response = await apiRequest('https://social.m-gh.com/api/v1/user/profile/detail/', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  
  return data;
};

// Refresh access token
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await fetch(`${BASE_URL}refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to refresh token');
  }
  
  // Update tokens
  setTokens(data.access, data.refresh);
  
  return data;
};

// Logout
export const logout = () => {
  clearTokens();
};

// Check if access token is expired
export const isAccessTokenExpired = () => {
  const token = getAccessToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp <= currentTime;
  } catch (error) {
    return true;
  }
};

// Check if refresh token is expired
export const isRefreshTokenExpired = () => {
  const token = getRefreshToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp <= currentTime;
  } catch (error) {
    return true;
  }
};

// Check if user is authenticated (access token valid)
export const isAuthenticated = () => {
  return !isAccessTokenExpired();
};

// Check if token will expire soon (within 1 day for 7-day tokens)
export const isTokenExpiringSoon = () => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const oneDayFromNow = currentTime + (24 * 60 * 60); // 1 day in seconds
    return payload.exp < oneDayFromNow;
  } catch (error) {
    return false;
  }
};

// Get token expiration time
export const getTokenExpirationTime = () => {
  const token = getAccessToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

