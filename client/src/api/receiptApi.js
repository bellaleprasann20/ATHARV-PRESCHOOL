import API from './axios';

// Get all receipts (with optional filters: studentId, startDate, endDate, page, limit)
export const getReceipts = (params) => API.get('/receipts', { params });

// Get a single receipt by ID (full details)
export const getReceipt = (id) => API.get(`/receipts/${id}`);

// Download receipt as PDF (returns blob)
export const downloadReceipt = (id) =>
  API.get(`/receipts/${id}/download`, { responseType: 'blob' });