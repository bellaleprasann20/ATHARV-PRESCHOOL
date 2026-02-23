// authApi.js
import API from './axios';
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const changePassword = (data) => API.put('/auth/change-password', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getUsers = () => API.get('/auth/users');
export const deactivateUser = (id) => API.put(`/auth/users/${id}/deactivate`);