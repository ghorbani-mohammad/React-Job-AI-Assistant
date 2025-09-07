import { getAccessToken } from './auth';

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://social.m-gh.com/api/v1/';

// Helper function to get headers with authentication
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const getJobs = async ({ limit = 12, offset = 0, ordering = '-created_at', language = 'en' } = {}) => {
  const params = new URLSearchParams();
  params.set('ordering', ordering);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (language) params.set('language', language);
  if (API_KEY) params.set('api_key', API_KEY);

  const response = await fetch(`${BASE_URL}linkedin/job/?${params.toString()}`, {
    headers: getHeaders(),
  });
  const data = await response.json();
  return data;
};

export const searchJobs = async ({ query = '', limit = 12, offset = 0, ordering = '-created_at' } = {}) => {
  const params = new URLSearchParams();
  params.set('ordering', ordering);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  params.set('search', query ?? '');
  if (API_KEY) params.set('api_key', API_KEY);

  const response = await fetch(`${BASE_URL}linkedin/job/?${params.toString()}`, {
    headers: getHeaders(),
  });
  const data = await response.json();
  return data;
};

export const fetchByUrl = async (url) => {
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  const data = await response.json();
  return data;
};

// Favorites API functions
export const getFavorites = async () => {
  const response = await fetch(`${BASE_URL}linkedin/favorites/`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch favorites: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

export const addToFavorites = async (jobId) => {
  const response = await fetch(`${BASE_URL}linkedin/favorites/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ job_id: jobId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to add to favorites: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

export const removeFromFavorites = async (favoriteId) => {
  const response = await fetch(`${BASE_URL}linkedin/favorites/${favoriteId}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to remove from favorites: ${response.status}`);
  }
  
  // DELETE requests typically return 204 No Content, so we handle that case
  if (response.status === 204) {
    return { message: 'Job removed from favorites' };
  }
  
  const data = await response.json();
  return data;
};

export const getFavoriteById = async (favoriteId) => {
  const response = await fetch(`${BASE_URL}linkedin/favorites/${favoriteId}/`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch favorite: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};
