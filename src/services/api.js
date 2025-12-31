// src/services/api.js
import axios from 'axios';

const API_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/+$/, '')) ||
  'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Helper to pull token from the keys you actually use
const getAccessToken = () => {
  // adjust these keys to match your login code
  return (
    localStorage.getItem('access') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    null
  );
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // optional: only clear if it's a token issue
      const detail = error.response.data?.detail;
      if (detail && String(detail).toLowerCase().includes('token')) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('token');
      }
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
