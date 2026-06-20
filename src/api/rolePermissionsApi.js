import api from './axios';

// Roles
export const getRoles = () => api.get('/admin/roles');

export const createRole = (data) => api.post('/admin/roles', data);

export const updateRole = (id, data) => api.put(`/admin/roles/${id}`, data);

export const deleteRole = (id) => api.delete(`/admin/roles/${id}`);

export const reorderRoles = (items) => api.post('/admin/roles/reorder', { items });

// Menus
export const getMenus = () => api.get('/admin/menus');

export const createMenu = (data) => api.post('/admin/menus', data);

export const updateMenu = (id, data) => api.put(`/admin/menus/${id}`, data);

export const deleteMenu = (id) => api.delete(`/admin/menus/${id}`);

export const reorderMenus = (items) => api.post('/admin/menus/reorder', { items });

// Permissions
export const getRolePermissions = () => api.get('/admin/role-permissions');

export const updateRolePermissions = (data) => api.put('/admin/role-permissions', data);

export const getRolePermissionsByRoleName = (roleName) => api.get(`/config/role-permissions/${roleName}`);
