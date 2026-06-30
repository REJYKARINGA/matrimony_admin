import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaBan, FaUnlock, FaPlus, FaEdit, FaTrash, FaUndo, FaFilter, FaTimes, FaSearch, FaUsers, FaChevronDown } from 'react-icons/fa';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';
import TimeFormatCell from '../components/TimeFormatCell';
import { getRoles } from '../api/rolePermissionsApi';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [emailFilter, setEmailFilter] = useState('all');
    const [phoneFilter, setPhoneFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const { showToast, ToastComponent } = useToast();

    // Mobile filter drawer
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Form Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Roles for dynamic dropdown and tabs
    const [roleOptions, setRoleOptions] = useState([]);

    useEffect(() => {
        getRoles().then(res => {
            const roles = res.data.roles || [];
            setRoleOptions(roles);
        }).catch(() => { });
    }, []);

    // Confirm Modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: '', message: '' });
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        fetchUsers(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, activeTab, emailFilter, phoneFilter, statusFilter, genderFilter, sortBy, sortDir]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: {
                    search,
                    page,
                    role: activeTab,
                    ...(emailFilter !== 'all' && { email_verified: emailFilter }),
                    ...(phoneFilter !== 'all' && { phone_verified: phoneFilter }),
                    ...(statusFilter !== 'all' && { status: statusFilter }),
                    ...(genderFilter !== 'all' && { gender: genderFilter }),
                    sort_by: sortBy,
                    sort_dir: sortDir,
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
        setBlockReason('');
        setConfirmModal({ isOpen: true, id, action, message });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.id) return;
        try {
            if (confirmModal.action === 'toggleBlock') {
                await api.post(`/admin/users/${confirmModal.id}/toggle-block`, {
                    block_reason: blockReason || undefined
                });
            } else if (confirmModal.action === 'delete') {
                await api.delete(`/admin/users/${confirmModal.id}`);
            } else if (confirmModal.action === 'restore') {
                await api.post(`/admin/users/${confirmModal.id}/restore`);
            }
            fetchUsers(currentPage); // Refresh current page
        } catch (error) {
            console.error('Action failed:', error);
            showToast('Failed to perform action', 'error');
        } finally {
            setConfirmModal({ isOpen: false, id: null, action: '', message: '' });
            setBlockReason('');
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
            setBlockReason(''); // Reset block reason after saving
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
                ...roleOptions.map(r => ({ value: r.name, label: r.label }))
            ],
            defaultValue: selectedUser?.role || 'user'
        }
    ];

    const activeFilterCount = [emailFilter, phoneFilter, statusFilter, genderFilter]
        .filter(v => v !== 'all').length;

    const resetFilters = () => {
        setEmailFilter('all');
        setPhoneFilter('all');
        setStatusFilter('all');
        setGenderFilter('all');
    };

    const FilterControls = (
        <>
            <select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)}>
                <option value="all">Email: All</option>
                <option value="1">Email: Verified</option>
                <option value="0">Email: Unverified</option>
            </select>
            <select value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)}>
                <option value="all">Phone: All</option>
                <option value="1">Phone: Verified</option>
                <option value="0">Phone: Unverified</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Status: All</option>
                <option value="active">Status: Active</option>
                <option value="blocked">Status: Blocked</option>
            </select>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                <option value="all">Gender: All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <select className="sort-select" value={`${sortBy}-${sortDir}`} onChange={(e) => {
                const [by, dir] = e.target.value.split('-');
                setSortBy(by); setSortDir(dir);
            }} style={{ fontWeight: '500' }}>
                <option value="created_at-desc">Sort: Newest</option>
                <option value="created_at-asc">Sort: Oldest</option>
                <option value="last_active_at-desc">Sort: Last Active</option>
                <option value="last_active_at-asc">Sort: Oldest Active</option>
                <option value="updated_at-desc">Sort: Last Updated</option>
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
            </select>
        </>
    );

    return (
        <div className="users-page">
            {/* Scoped styles only for this page — index.css is untouched */}
            <style>{`
                .users-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .users-page .um-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .users-page .um-stat-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    border-radius: 14px;
                    border: 1px solid var(--border-color);
                    background: var(--hover-bg);
                }
                .users-page .um-stat-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                    color: white;
                }
                .users-page .um-stat-icon.total { background: linear-gradient(135deg, var(--primary), var(--secondary)); }
                .users-page .um-stat-icon.active { background: #10B981; }
                .users-page .um-stat-icon.blocked { background: #EF4444; }
                .users-page .um-stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    line-height: 1.1;
                }
                .users-page .um-stat-label {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .users-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .users-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .users-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .users-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .users-page .um-filter-toggle {
                    display: none;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1.5px solid var(--border-color);
                    background: var(--card-bg);
                    color: var(--text);
                    border-radius: 10px;
                    padding: 0.55rem 0.9rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .users-page .um-filter-badge {
                    background: var(--primary);
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.68rem;
                    min-width: 18px;
                    height: 18px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 5px;
                }
                .users-page .um-cards { display: none; }
                .users-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .users-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .users-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .users-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .users-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .users-page .um-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .users-page .um-card-actions .btn {
                    flex: 1 1 auto;
                    justify-content: center;
                    padding: 0.55rem 0.75rem;
                }
                .users-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .users-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .users-page .um-skel-row {
                    height: 56px;
                    border-radius: 10px;
                    margin-bottom: 0.6rem;
                    background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%);
                    background-size: 400% 100%;
                    animation: um-shimmer 1.4s ease infinite;
                }
                @keyframes um-shimmer {
                    0% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
                .users-page .um-filter-drawer {
                    display: none;
                }

                @media (max-width: 768px) {
                    .users-page .um-table-wrap { display: none; }
                    .users-page .um-cards { display: block; }
                    .users-page .um-filter-toggle { display: inline-flex; }
                    .users-page .filter-bar { display: none; }
                    .users-page .um-filter-drawer.open {
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--hover-bg);
                    }
                    .users-page .um-filter-drawer select {
                        width: 100%;
                        appearance: none;
                        -webkit-appearance: none;
                        background-color: var(--card-bg);
                        color: var(--text);
                        border: 1.5px solid var(--border-color);
                        border-radius: 10px;
                        padding: 0.7rem 2.25rem 0.7rem 0.9rem;
                        font-size: 0.85rem;
                        font-weight: 500;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-position: right 0.85rem center;
                        background-size: 1.1rem;
                    }
                    .users-page .um-filter-drawer select:focus {
                        outline: none;
                        border-color: var(--primary);
                        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18);
                    }
                    .users-page .um-stats { grid-template-columns: 1fr 1fr; }
                    .users-page .um-stats .um-stat-card:last-child { grid-column: 1 / -1; }
                }

                @media (min-width: 769px) {
                    .users-page .um-filter-drawer { display: none !important; }
                }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>User Management</h2>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Manage accounts, verification, and access across your platform.
                            </p>
                        </div>
                        <button onClick={handleAddUser} className="btn btn-primary">
                            <FaPlus /> Add User
                        </button>
                    </div>

                    {/* Search + filter toggle */}
                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, matrimony ID, reference code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="um-filter-toggle"
                            onClick={() => setFiltersOpen(o => !o)}
                        >
                            {filtersOpen ? <FaTimes /> : <FaFilter />}
                            Filters
                            {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    {/* Mobile filter drawer */}
                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        {FilterControls}
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={resetFilters} style={{ justifyContent: 'center' }}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="tabs-scroll">
                        {[{ name: 'all', label: 'All' }, ...roleOptions, { name: 'trashed', label: 'Deleted Users' }].map(role => (
                            <button key={role.name} onClick={() => setActiveTab(role.name)} style={{
                                borderBottom: activeTab === role.name
                                    ? `3px solid ${role.name === 'trashed' ? '#EF4444' : 'var(--primary)'}`
                                    : '3px solid transparent',
                                color: activeTab === role.name
                                    ? (role.name === 'trashed' ? '#EF4444' : 'var(--primary)')
                                    : 'var(--text-secondary)',
                            }}>{role.label}</button>
                        ))}
                    </div>

                    {/* Desktop filter row */}
                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        {FilterControls}
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={resetFilters} style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                                <FaTimes /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : users.length === 0 ? (
                    <div className="um-empty">
                        <FaUsers />
                        <p style={{ margin: 0, fontWeight: 600 }}>No users found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Gender</th>
                                            <th>Contact</th>
                                            <th>Reference Code</th>
                                            <th>Role</th>
                                            <th>Email Status</th>
                                            <th>Phone Status</th>
                                            <th>Status / Activity</th>
                                            <th>Block Reason</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <UserCell user={user} profile={user?.user_profile} />
                                                </td>
                                                <td>
                                                    <span style={{ textTransform: 'capitalize', fontWeight: '500', color: user.user_profile?.gender === 'male' ? '#60a5fa' : user.user_profile?.gender === 'female' ? '#f472b6' : 'var(--text-secondary)' }}>
                                                        {user.user_profile?.gender || '—'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>{user.email}</div>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.phone}</div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-primary">
                                                        {user.reference_code || '—'}
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
                                                    <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '4px' }}>
                                                        <span style={{ opacity: 0.7 }}>Activity:</span>
                                                        <TimeFormatCell date={user.last_active_at} />
                                                    </div>
                                                </td>
                                                <td>
                                                    {user.status === 'blocked' && (
                                                        <div style={{ maxWidth: '150px', fontSize: '0.8rem', color: '#EF4444', fontStyle: 'italic' }}>
                                                            {user.block_reason || 'No reason provided'}
                                                        </div>
                                                    )}
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
                                                                    user.status === 'active'
                                                                        ? `You are about to block "${user.user_profile?.first_name} ${user.user_profile?.last_name}". All users who unlocked this contact will be notified. Please provide a reason:`
                                                                        : `Are you sure you want to unblock "${user.user_profile?.first_name} ${user.user_profile?.last_name}"?`
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
                        </div>

                        {/* Mobile cards */}
                        <div className="um-cards">
                            {users.map((user) => (
                                <div className="um-card" key={user.id}>
                                    <div className="um-card-top">
                                        <UserCell user={user} profile={user?.user_profile} />
                                        <span className={`badge ${user.status === 'active' ? 'badge-verified' : 'badge-rejected'}`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Email</dt>
                                            <dd>{user.email}</dd>
                                        </div>
                                        <div>
                                            <dt>Phone</dt>
                                            <dd>{user.phone}</dd>
                                        </div>
                                        <div>
                                            <dt>Role</dt>
                                            <dd style={{ textTransform: 'capitalize' }}>{user.role}</dd>
                                        </div>
                                        <div>
                                            <dt>Reference</dt>
                                            <dd>{user.reference_code || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Email Status</dt>
                                            <dd>
                                                <span className={`badge ${user.email_verified ? 'badge-verified' : 'badge-rejected'}`} style={{ fontSize: '0.7rem' }}>
                                                    {user.email_verified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Phone Status</dt>
                                            <dd>
                                                <span className={`badge ${user.phone_verified ? 'badge-verified' : 'badge-rejected'}`} style={{ fontSize: '0.7rem' }}>
                                                    {user.phone_verified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Last Active</dt>
                                            <dd><TimeFormatCell date={user.last_active_at} /></dd>
                                        </div>
                                        {user.status === 'blocked' && (
                                            <div>
                                                <dt>Block Reason</dt>
                                                <dd style={{ color: '#EF4444', fontStyle: 'italic' }}>{user.block_reason || 'No reason provided'}</dd>
                                            </div>
                                        )}
                                    </dl>
                                    <div className="um-card-actions">
                                        <button onClick={() => handleEditUser(user)} className="btn btn-secondary" title="Edit User">
                                            <FaEdit /> Edit
                                        </button>
                                        {activeTab !== 'trashed' && (
                                            <button
                                                onClick={() => openConfirmModal(
                                                    user.id,
                                                    'toggleBlock',
                                                    user.status === 'active'
                                                        ? `You are about to block "${user.user_profile?.first_name} ${user.user_profile?.last_name}". All users who unlocked this contact will be notified. Please provide a reason:`
                                                        : `Are you sure you want to unblock "${user.user_profile?.first_name} ${user.user_profile?.last_name}"?`
                                                )}
                                                className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                                                title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                            >
                                                {user.status === 'active' ? <FaBan /> : <FaUnlock />} {user.status === 'active' ? 'Block' : 'Unblock'}
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
                                                <FaUndo /> Restore
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
                                            <FaTrash /> {activeTab === 'trashed' ? 'Erase' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))}
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

            {ToastComponent}

            {/* Custom Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, action: '', message: '' })}
                onConfirm={handleConfirmAction}
                title={confirmModal.action === 'delete' ? 'Delete User' : 'Confirm Action'}
                message={confirmModal.message}
                confirmButtonClass={confirmModal.action === 'delete' || confirmModal.action === 'toggleBlock' ? 'btn-danger' : 'btn-primary'}
                showInput={confirmModal.action === 'toggleBlock' && users.find(u => u.id === confirmModal.id)?.status === 'active'}
                inputPlaceholder="Reason for blocking..."
                inputValue={blockReason}
                onInputChange={setBlockReason}
                suggestions={[
                    'Fake Profile',
                    'Harassment',
                    'Spam/Fraud',
                    'Commercial Use',
                    'Inappropriate Behavior',
                    'Multiple Accounts'
                ]}
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

                    if (data.status === 'blocked' && formData.get('block_reason')) {
                        data.block_reason = formData.get('block_reason');
                    }

                    handleSaveUser(data);
                }}
                onClose={() => {
                    setIsModalOpen(false);
                    setBlockReason('');
                }}
            >
                <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
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

                {/* Status Toggles in a responsive row */}
                <div className="grid-3" style={{ padding: '1.25rem', background: 'var(--hover-bg)', borderRadius: '12px' }}>
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
                            <input
                                type="checkbox"
                                name="status"
                                defaultChecked={!selectedUser || selectedUser.status === 'active'}
                                onChange={() => {
                                    // Force a re-render to show/hide the block reason field
                                    setConfirmModal(prev => ({ ...prev }));
                                }}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                {/* Conditional Block Reason Field inside FormModal */}
                {selectedUser && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label className="form-label" style={{ fontWeight: 'bold', color: '#EF4444' }}>
                            Block Reason (visible to user)
                        </label>
                        <input
                            type="text"
                            name="block_reason"
                            className="form-input"
                            placeholder="Why is this account being blocked/restricted?"
                            defaultValue={selectedUser.block_reason || ''}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            If you set the user to inactive/blocked, they will see this reason when they try to log in.
                        </p>
                    </div>
                )}
            </FormModal>
        </div>
    );
}