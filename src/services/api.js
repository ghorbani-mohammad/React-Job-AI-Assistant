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
