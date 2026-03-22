import api from './axios';

export const interestApi = {
    getAll: (params) => api.get('/admin/interests', { params }),
    getTypes: () => api.get('/admin/interests/types'),
    create: (data) => api.post('/admin/interests', data),
    update: (id, data) => api.put(`/admin/interests/${id}`, data),
    delete: (id) => api.delete(`/admin/interests/${id}`),
    updateCategory: (data) => api.put('/admin/interests/category/update', data),
    deleteCategory: (data) => api.delete('/admin/interests/category/delete', { data }),
    bulkUpdateTrending: (data) => api.post('/admin/interests/bulk-update-trending', data),
};
