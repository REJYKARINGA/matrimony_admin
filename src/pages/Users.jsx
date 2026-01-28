import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaBan, FaUnlock } from 'react-icons/fa';
import Pagination from '../components/Pagination';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

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

    const toggleBlock = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.post(`/admin/users/${id}/toggle-block`);
            fetchUsers(currentPage); // Refresh current page
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>User Management</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '300px', marginBottom: 0 }}
                />
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
                                            <span className={`badge ${user.status === 'active' ? 'badge-verified' : 'badge-rejected'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleBlock(user.id)}
                                                className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                                                title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                            >
                                                {user.status === 'active' ? <FaBan /> : <FaUnlock />}
                                            </button>
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
    );
}
