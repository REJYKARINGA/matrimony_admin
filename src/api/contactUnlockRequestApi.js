import api from './axios';

export const contactUnlockRequestApi = {
    getRequests: (params) => api.get('/admin/contact-unlock-requests', { params }),
    respondToRequest: (id, status) => api.put(`/admin/contact-unlock-requests/${id}/respond`, { status }),
};
