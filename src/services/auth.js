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
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }
  
  const response = await fetch('https://social.m-gh.com/api/v1/user/profile/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user profile');
  }
  
  return data;
};

// Get/Update profile detail
export const getProfileDetail = async () => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }
  
  const response = await fetch('https://social.m-gh.com/api/v1/user/profile/detail/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get profile detail');
  }
  
  return data;
};

export const updateProfileDetail = async (profileData) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }
  
  const response = await fetch('https://social.m-gh.com/api/v1/user/profile/detail/', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};
