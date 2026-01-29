import api from './axios';

export const educationApi = {
  getAll: (params) => api.get('/admin/education', { params }),
  create: (data) => api.post('/admin/education', data),
  update: (id, data) => api.put(`/admin/education/${id}`, data),
  delete: (id) => api.delete(`/admin/education/${id}`),
};