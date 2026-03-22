import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaBan, FaUnlock, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Form Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Confirm Modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: '', message: '' });

    useEffect(() => {
        fetchUsers(1);
    }, [search]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: {
                    search,
                    page
                }
            });
            setUsers(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchUsers(page);
    };

    const openConfirmModal = (id, action, message) => {
        setConfirmModal({ isOpen: true, id, action, message });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.id) return;
        try {
            if (confirmModal.action === 'toggleBlock') {
                await api.post(`/admin/users/${confirmModal.id}/toggle-block`);
            } else if (confirmModal.action === 'delete') {
                await api.delete(`/admin/users/${confirmModal.id}`);
            }
            fetchUsers(currentPage); // Refresh current page
        } catch (error) {
            console.error('Action failed:', error);
            alert('Failed to perform action');
        } finally {
            setConfirmModal({ isOpen: false, id: null, action: '', message: '' });
        }
    };

    const handleSaveUser = async (formData) => {
        try {
            if (selectedUser) {
                await api.put(`/admin/users/${selectedUser.id}`, formData);
            } else {
                await api.post('/admin/users', formData);
            }
            fetchUsers(currentPage);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save user:', error);
            throw error; // Let FormModal handle the error display if it has logic for it
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const userFormFields = [
        { name: 'first_name', label: 'First Name', type: 'text', required: true, defaultValue: selectedUser?.user_profile?.first_name || '' },
        { name: 'last_name', label: 'Last Name', type: 'text', required: false, defaultValue: selectedUser?.user_profile?.last_name || '' },
        { name: 'email', label: 'Email', type: 'email', required: true, defaultValue: selectedUser?.email || '' },
        { name: 'phone', label: 'Phone', type: 'text', required: true, defaultValue: selectedUser?.phone || '' },
        { 
            name: 'password', 
            label: selectedUser ? 'Password (leave blank to keep current)' : 'Password', 
            type: 'password', 
            required: !selectedUser,
            defaultValue: ''
        },
        { 
            name: 'role', 
            label: 'Role', 
            type: 'select', 
            required: true, 
            options: [
                { value: 'user', label: 'User' },
                { value: 'mediator', label: 'Mediator' },
                { value: 'admin', label: 'Admin' }
            ],
            defaultValue: selectedUser?.role || 'user'
        },
        { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            required: true, 
            options: [
                { value: 'active', label: 'Active' },
                { value: 'blocked', label: 'Blocked' }
            ],
            defaultValue: selectedUser?.status || 'active'
        },
        {
            name: 'email_verified',
            label: 'Email Verified',
            type: 'select',
            required: true,
            options: [
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
            ],
            defaultValue: selectedUser?.email_verified ? '1' : '0'
        },
        {
            name: 'phone_verified',
            label: 'Phone Verified',
            type: 'select',
            required: true,
            options: [
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' }
            ],
            defaultValue: selectedUser?.phone_verified ? '1' : '0'
        }
    ];

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>User Management</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '300px', marginBottom: 0 }}
                    />
                    <button onClick={handleAddUser} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPlus /> Add User
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Matrimony ID</th>
                                    <th>Role</th>
                                    <th>Email Status</th>
                                    <th>Phone Status</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {user.user_profile?.first_name || 'N/A'} {user.user_profile?.last_name || ''}
                                            </div>
                                        </td>
                                        <td>
                                            <div>{user.email}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.phone}</div>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                                                {user.matrimony_id}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.email_verified ? 'badge-verified' : 'badge-rejected'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                                                {user.email_verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.phone_verified ? 'badge-verified' : 'badge-rejected'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                                                {user.phone_verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.status === 'active' ? 'badge-verified' : 'badge-rejected'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="btn btn-secondary"
                                                    title="Edit User"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => openConfirmModal(
                                                        user.id, 
                                                        'toggleBlock', 
                                                        `Are you sure you want to ${user.status === 'active' ? 'block' : 'unblock'} this user?`
                                                    )}
                                                    className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                                                    title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                                >
                                                    {user.status === 'active' ? <FaBan /> : <FaUnlock />}
                                                </button>
                                                <button
                                                    onClick={() => openConfirmModal(
                                                        user.id, 
                                                        'delete', 
                                                        'Are you sure you want to completely delete this user? This action cannot be undone.'
                                                    )}
                                                    className="btn btn-danger"
                                                    title="Delete User"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalItems}
                        itemsPerPage={15}
                    />
                </>
            )}

            {/* Custom Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, action: '', message: '' })}
                onConfirm={handleConfirmAction}
                title={confirmModal.action === 'delete' ? 'Delete User' : 'Confirm Action'}
                message={confirmModal.message}
                confirmButtonClass={confirmModal.action === 'delete' || confirmModal.action === 'toggleBlock' ? 'btn-danger' : 'btn-primary'}
            />

            {/* Form Modal for Add/Edit User */}
            {isModalOpen && (
                <FormModal
                    title={selectedUser ? 'Edit User' : 'Add User'}
                    fields={userFormFields}
                    onSubmit={handleSaveUser}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
