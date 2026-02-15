import api from './axios';

export const religionApi = {
    // Religion endpoints
    getAllReligions: (params) => api.get('/admin/religions', { params }),
    createReligion: (data) => api.post('/admin/religions', data),
    updateReligion: (id, data) => api.put(`/admin/religions/${id}`, data),
    deleteReligion: (id) => api.delete(`/admin/religions/${id}`),

    // Caste endpoints
    getAllCastes: (params) => api.get('/admin/castes', { params }),
    createCaste: (data) => api.post('/admin/castes', data),
    updateCaste: (id, data) => api.put(`/admin/castes/${id}`, data),
    deleteCaste: (id) => api.delete(`/admin/castes/${id}`),

    // SubCaste endpoints
    getAllSubCastes: (params) => api.get('/admin/sub-castes', { params }),
    createSubCaste: (data) => api.post('/admin/sub-castes', data),
    updateSubCaste: (id, data) => api.put(`/admin/sub-castes/${id}`, data),
    deleteSubCaste: (id) => api.delete(`/admin/sub-castes/${id}`),
};
