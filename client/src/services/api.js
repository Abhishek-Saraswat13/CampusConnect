import axios from 'axios';

// In dev, VITE_API_URL is left unset and Vite's proxy (vite.config.js)
// forwards /api to the local backend. In production, set VITE_API_URL to
// the deployed backend's base URL, e.g. https://your-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so every caller can just read err.message and,
// where present, err.data (e.g. the attendedAt timestamp on a 409).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const { message, data } = error.response.data || {};
      const normalized = new Error(message || 'Something went wrong');
      normalized.status = error.response.status;
      normalized.data = data;
      return Promise.reject(normalized);
    }
    if (error.request) {
      return Promise.reject(new Error('Network error - could not reach the server'));
    }
    return Promise.reject(error);
  }
);

export default api;
