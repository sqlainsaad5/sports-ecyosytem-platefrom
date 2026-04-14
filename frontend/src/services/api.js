import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  /** FormData uploads: do not send application/json — browser must set multipart boundary for multer */
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export function getErrorMessage(err) {
  return err.response?.data?.message || err.message || 'Request failed';
}
