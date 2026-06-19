import api from './axios';

export const getThemeSettings = () => api.get('/admin/theme-settings');

export const updateThemeSettings = (data) => api.put('/admin/theme-settings', data);
