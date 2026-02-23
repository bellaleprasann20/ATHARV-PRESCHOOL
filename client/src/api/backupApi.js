import API from './axios';

// Create a new manual backup
export const createBackup = () => API.post('/backup');

// Get all backup logs (history)
export const getBackups = () => API.get('/backup');

// Download a backup file as JSON
export const downloadBackup = (id) =>
  API.get(`/backup/${id}/download`, { responseType: 'blob' });

// Delete a backup record and its file
export const deleteBackup = (id) => API.delete(`/backup/${id}`);

// Restore database from a backup (DANGER: overwrites data)
export const restoreBackup = (id) => API.post(`/backup/${id}/restore`);