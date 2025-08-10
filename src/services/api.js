const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://social.m-gh.com/api/v1/';

export const getJobs = async () => {
    const response = await fetch(`${BASE_URL}linkedin/ignored-job/?ordering=-created_at&api_key=${API_KEY ?? ''}`);
    const data = await response.json();
    return data;
};

export const searchJobs = async (query) => {
    const response = await fetch(
        `${BASE_URL}linkedin/ignored-job/?ordering=-created_at&search=${encodeURIComponent(query)}&api_key=${API_KEY ?? ''}`
    );
    const data = await response.json();
    return data;
};
