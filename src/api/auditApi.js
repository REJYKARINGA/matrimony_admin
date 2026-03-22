import api from './axios';

export const auditApi = {
    getLoginHistories: (params) => api.get('/admin/login-histories', { params }),
    getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
};
