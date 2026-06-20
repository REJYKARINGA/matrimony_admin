import axios from 'axios';
import { CONFIG } from '../config';
import { notifyPermissionDenied } from './permissionGuard';

const api = axios.create({
    baseURL: CONFIG.API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 403 && error.response?.data?.required_menu) {
            notifyPermissionDenied(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
