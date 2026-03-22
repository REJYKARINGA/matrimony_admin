import api from './axios';

export const unlockApi = {
    getContactUnlocks: (params) => api.get('/admin/contact-unlocks', { params }),
};
