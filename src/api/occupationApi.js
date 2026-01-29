import api from './axios';

export const occupationApi = {
  getAll: (params) => api.get('/admin/occupations', { params }),
  create: (data) => api.post('/admin/occupations', data),
  update: (id, data) => api.put(`/admin/occupations/${id}`, data),
  delete: (id) => api.delete(`/admin/occupations/${id}`),
};