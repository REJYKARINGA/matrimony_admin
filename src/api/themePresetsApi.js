import api from './axios';

export const getThemePresets = () => api.get('/admin/theme-presets');

export const saveThemePreset = (data) => api.post('/admin/theme-presets', data);

export const updateThemePreset = (id, data) => api.put(`/admin/theme-presets/${id}`, data);

export const deleteThemePreset = (id) => api.delete(`/admin/theme-presets/${id}`);

export const applyThemePreset = (id) => api.post(`/admin/theme-presets/${id}/apply`);
