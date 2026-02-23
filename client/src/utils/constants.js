/**
 * Academic Configuration
 */
export const ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27'];

export const CLASSES = [
  'Nursery',
  'Junior KG',
  'Senior KG',
  'Playgroup',
  'Grade 1',
  'Grade 2'
];

export const SECTIONS = ['A', 'B', 'C', 'D'];

/**
 * Fee Related Constants
 */
export const FEE_CATEGORIES = [
  'Tuition Fee',
  'Admission Fee',
  'Transport Fee',
  'Books & Uniform',
  'Examination Fee',
  'Security Deposit',
  'Activity Fee'
];

export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI / Online' },
  { value: 'bank_transfer', label: 'Bank Transfer' }
];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

/**
 * UI / Branding Constants
 */
export const SCHOOL_DETAILS = {
  NAME: 'Atharv Preschool',
  ADDRESS: '123 Education Lane, Learning City, Maharashtra 411001',
  PHONE: '+91 98765 43210',
  EMAIL: 'admin@atharv.edu',
  WEBSITE: 'www.atharvpreschool.edu'
};

/**
 * Role Based Access
 */
export const ROLES = {
  ADMIN: 'admin',
  PARENT: 'parent',
  TEACHER: 'teacher'
};

/**
 * API Endpoints (Optional: if not using a central axios config)
 */
export const ENDPOINTS = {
  LOGIN: '/auth/login',
  STUDENTS: '/students',
  PAYMENTS: '/payments',
  REPORTS: '/reports'
};