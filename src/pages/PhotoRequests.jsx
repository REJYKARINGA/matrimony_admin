import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import TimeFormatCell from '../components/TimeFormatCell';
import { FaCamera, FaSearch, FaHistory } from 'react-icons/fa';

const SELECT_STYLE = {
    padding: '0.4rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    outline: 'none'
};

export default function PhotoRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchRequests(1);
    }, [search, statusFilter]);

    const fetchRequests = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/photo-requests', {
                params: {
                    search: search || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    page
                }
            });
            setRequests(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch photo requests', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted': return <span className="badge badge-verified">Accepted</span>;
            case 'rejected': return <span className="badge badge-rejected">Rejected</span>;
            case 'pending': return <span className="badge badge-warning">Pending</span>;
            default: return <span className="badge badge-secondary">{status}</span>;
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                        width: '45px', height: '45px', borderRadius: '12px', 
                        background: 'rgba(var(--primary-rgb), 0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', fontSize: '1.2rem'
                    }}>
                        <FaCamera />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Photo Status Monitoring</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monitoring photo access requests for safety</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.9rem' }} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ 
                                width: '260px', paddingLeft: '2.5rem', marginBottom: 0,
                                borderRadius: '10px', height: '42px'
                            }}
                        />
                    </div>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ ...SELECT_STYLE, height: '42px', minWidth: '140px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading requests...</p>
                </div>
            ) : (
                <>
                    <div className="table-container shadow-sm" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Requester</th>
                                    <th>Receiver</th>
                                    <th>Status</th>
                                    <th>Requested On</th>
                                    <th>Last Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                            <FaHistory style={{ fontSize: '2rem', display: 'block', margin: '0 auto 1rem', opacity: 0.3 }} />
                                            No photo requests found
                                        </td>
                                    </tr>
                                ) : requests.map((request) => (
                                    <tr key={request.id}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {request.requester?.user_profile?.first_name} {request.requester?.user_profile?.last_name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                ID: {request.requester?.matrimony_id || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {request.receiver?.user_profile?.first_name} {request.receiver?.user_profile?.last_name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                ID: {request.receiver?.matrimony_id || 'N/A'}
                                            </div>
                                            {request.receiver?.user_profile?.gender === 'female' && (
                                                <span style={{ fontSize: '0.7rem', background: 'rgba(244, 114, 182, 0.1)', color: '#f472b6', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Women Protection Active</span>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(request.status)}</td>
                                        <td>
                                            <TimeFormatCell date={request.created_at} />
                                        </td>
                                        <td>
                                            <TimeFormatCell date={request.updated_at} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={fetchRequests}
                        totalItems={totalItems}
                        itemsPerPage={15}
                    />
                </>
            )}
        </div>
    );
}
