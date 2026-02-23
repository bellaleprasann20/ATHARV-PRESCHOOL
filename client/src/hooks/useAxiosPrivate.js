import { useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from './useAuth';

export const useAxiosPrivate = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    const requestIntercept = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (!config.headers['Authorization'] && token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      }, (error) => Promise.reject(error)
    );

    const responseIntercept = axios.interceptors.response.use(
      response => response,
      async (error) => {
        if (error?.response?.status === 401) {
          logout(); // Auto logout if token expires
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestIntercept);
      axios.interceptors.response.eject(responseIntercept);
    };
  }, [user, logout]);

  return axios;
};