import API from './axios';

// feeApi
export const getFeeStructures = (params) => API.get('/fees/structures', { params });
export const getFeeStructure = (id) => API.get(`/fees/structures/${id}`);
export const createFeeStructure = (data) => API.post('/fees/structures', data);
export const updateFeeStructure = (id, data) => API.put(`/fees/structures/${id}`, data);
export const deleteFeeStructure = (id) => API.delete(`/fees/structures/${id}`);
export const assignFee = (data) => API.post('/fees/assign', data);
export const getStudentFeeAssignment = (studentId, params) => API.get(`/fees/assignment/${studentId}`, { params });
export const getDueFees = (params) => API.get('/fees/dues', { params });

// ── Parent portal APIs ────────────────────────────────────────
export const getParentProfile    = ()       => API.get('/parent/profile');
export const getParentFees       = (params) => API.get('/parent/fees', { params });
export const getParentReceipts   = (params) => API.get('/parent/receipts', { params });
export const createParentOrder   = (data)   => API.post('/parent/pay/create-order', data);
export const verifyParentPayment = (data)   => API.post('/parent/pay/verify', data);