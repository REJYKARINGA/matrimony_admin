import api from './axios';

export const getAdminSettings = () => api.get('/admin/admin-settings');

export const updateAdminSettings = (data) => api.put('/admin/admin-settings', data);
