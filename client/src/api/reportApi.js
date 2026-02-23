import API from './axios';

// Dashboard summary (students, monthly collection, pending dues, recent payments)
export const getDashboardStats = () => API.get('/reports/dashboard');

// Monthly fee collection report (grouped by month + payment mode)
export const getMonthlyReport = (params) => API.get('/reports/monthly', { params });

// Class-wise collection vs pending report
export const getClassWiseReport = (params) => API.get('/reports/class-wise', { params });

// Students with overdue fees (defaulters list)
export const getDefaulters = (params) => API.get('/reports/defaulters', { params });

// Export reports to Excel (.xlsx) — type: 'payments' | 'defaulters' | 'students'
export const exportReport = (params) =>
  API.get('/reports/export', { params, responseType: 'blob' });