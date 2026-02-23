import API from './axios';

// Get all students (supports: page, limit, search, class, status, academicYear)
export const getStudents = (params) => API.get('/students', { params });

// Get a single student by ID (with parent info populated)
export const getStudent = (id) => API.get(`/students/${id}`);

// Add a new student (supports photo upload via FormData)
export const createStudent = (data) =>
  API.post('/students', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Update student details (photo upload optional)
export const updateStudent = (id, data) =>
  API.put(`/students/${id}`, data, {
    headers: data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : {},
  });

// Soft-delete (deactivate) a student by ID
export const deleteStudent = (id) => API.delete(`/students/${id}`);

// Get total student count grouped by class (for dashboard pie chart)
export const getStudentStats = () => API.get('/students/stats');