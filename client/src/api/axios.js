import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message       = error.response?.data?.message || 'Something went wrong.';
    const status        = error.response?.status;
    const isLoginRoute  = error.config?.url?.includes('/auth/login');
    const isMeRoute     = error.config?.url?.includes('/auth/me');

    if (status === 401 && !isLoginRoute && !isMeRoute) {
      // Only wipe + redirect for protected routes, not for login or token-check
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('Access denied.');
    } else if (status >= 500 && !isLoginRoute) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject({ ...error, message });
  }
);

export default API;