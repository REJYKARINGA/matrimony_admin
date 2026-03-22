import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaBan, FaUnlock, FaPlus, FaEdit, FaTrash, FaUndo } from 'react-icons/fa';
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
    const [activeTab, setActiveTab] = useState('all');

    // Form Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Confirm Modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: '', message: '' });

    useEffect(() => {
        fetchUsers(1);
    }, [search, activeTab]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: {
                    search,
                    page,
                    role: activeTab
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
            } else if (confirmModal.action === 'restore') {
                await api.post(`/admin/users/${confirmModal.id}/restore`);
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
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setFormErrors({});
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
        }
    ];

    return (
        <>
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

                {/* Tab Navigation */}
                <div className="tab-nav" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('all')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.75rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderBottom: activeTab === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('user')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.75rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderBottom: activeTab === 'user' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'user' ? 'var(--primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('mediator')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.75rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderBottom: activeTab === 'mediator' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'mediator' ? 'var(--primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Mediators
                    </button>
                    <button
                        onClick={() => setActiveTab('admin')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.75rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderBottom: activeTab === 'admin' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: activeTab === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Admins
                    </button>
                    <button
                        onClick={() => setActiveTab('trashed')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.75rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderBottom: activeTab === 'trashed' ? '3px solid #EF4444' : '3px solid transparent',
                            color: activeTab === 'trashed' ? '#EF4444' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                            marginLeft: 'auto' // push to the right side if there's flex space
                        }}
                    >
                        Deleted Users
                    </button>
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
                                                    {activeTab !== 'trashed' && (
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
                                                    )}
                                                    {activeTab === 'trashed' && (
                                                        <button
                                                            onClick={() => openConfirmModal(
                                                                user.id, 
                                                                'restore', 
                                                                'Are you sure you want to completely restore this user to their original role?'
                                                            )}
                                                            className="btn btn-success"
                                                            title="Restore User"
                                                        >
                                                            <FaUndo /> 
                                                        </button>
                                                    )}
                                                    <button
                                                    onClick={() => openConfirmModal(
                                                        user.id, 
                                                        'delete', 
                                                        activeTab === 'trashed' 
                                                            ? 'Are you sure you want to completely erase this user? This cannot be undone.' 
                                                            : 'Are you sure you want to delete this user? They will be moved to the Deleted Users list.'
                                                    )}
                                                    className="btn btn-danger"
                                                    title={activeTab === 'trashed' ? "Permadelete" : "Trash User"}
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
            </div>

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
            <FormModal
                isOpen={isModalOpen}
                title={selectedUser ? 'Edit User' : 'Add User'}
                onSubmit={(e) => {
                    e.preventDefault();
                    setFormErrors({});
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    
                    let errors = {};
                    userFormFields.forEach(field => {
                        if (field.required && !data[field.name]) {
                            errors[field.name] = `${field.label} is required`;
                        }
                    });

                    // simple email format check
                    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
                        errors.email = 'Please enter a valid email format';
                    }

                    if (Object.keys(errors).length > 0) {
                        setFormErrors(errors);
                        return; // stop submission
                    }

                    // Convert checkbox states
                    data.status = formData.get('status') ? 'active' : 'blocked';
                    data.email_verified = formData.get('email_verified') ? 1 : 0;
                    data.phone_verified = formData.get('phone_verified') ? 1 : 0;

                    handleSaveUser(data);
                }}
                onClose={() => setIsModalOpen(false)}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {userFormFields.map((field) => (
                        <div className="form-group" key={field.name} style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                            </label>
                            {field.type === 'select' ? (
                                <select
                                    name={field.name}
                                    className={`form-input ${formErrors[field.name] ? 'input-error' : ''}`}
                                    defaultValue={field.defaultValue}
                                    style={formErrors[field.name] ? { borderColor: '#EF4444' } : {}}
                                >
                                    <option value="" disabled>Select {field.label}</option>
                                    {field.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    className={`form-input ${formErrors[field.name] ? 'input-error' : ''}`}
                                    defaultValue={field.defaultValue}
                                    style={formErrors[field.name] ? { borderColor: '#EF4444' } : {}}
                                />
                            )}
                            {formErrors[field.name] && (
                                <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                    {formErrors[field.name]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Status Toggles in a single row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1.25rem', background: 'var(--hover-bg)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', margin: 0 }}>Email Verified</label>
                        <label className="switch">
                            <input type="checkbox" name="email_verified" defaultChecked={selectedUser ? selectedUser.email_verified : false} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', margin: 0 }}>Phone Verified</label>
                        <label className="switch">
                            <input type="checkbox" name="phone_verified" defaultChecked={selectedUser ? selectedUser.phone_verified : false} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', margin: 0 }}>Active User</label>
                        <label className="switch">
                            <input type="checkbox" name="status" defaultChecked={!selectedUser || selectedUser.status === 'active'} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </FormModal>
        </>
    );
}
