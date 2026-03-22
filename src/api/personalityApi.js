import api from './axios';

export const personalityApi = {
    getAll: (params) => api.get('/admin/personalities', { params }),
    getTypes: () => api.get('/admin/personalities/types'),
    create: (data) => api.post('/admin/personalities', data),
    update: (id, data) => api.put(`/admin/personalities/${id}`, data),
    delete: (id) => api.delete(`/admin/personalities/${id}`),
    updateCategory: (data) => api.put('/admin/personalities/category/update', data),
    deleteCategory: (data) => api.delete('/admin/personalities/category/delete', { data }),
    bulkUpdateTrending: (data) => api.post('/admin/personalities/bulk-update-trending', data),
};
