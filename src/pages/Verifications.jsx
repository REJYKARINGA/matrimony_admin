import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaFileAlt } from 'react-icons/fa';
import Pagination from '../components/Pagination';

export default function Verifications() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchVerifications(1);
    }, []);

    const fetchVerifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/verifications/pending', {
                params: { page }
            });
            // According to updated backend: return response()->json($paginator);
            // So response.data is the paginator object.
            setVerifications(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchVerifications(page);
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this user?')) return;
        try {
            await api.post(`/admin/verifications/${id}/approve`);
            fetchVerifications(currentPage);
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:', 'Document invalid');
        if (!reason) return;
        try {
            await api.post(`/admin/verifications/${id}/reject`, { reason });
            fetchVerifications(currentPage);
        } catch (error) {
            alert('Failed to reject');
        }
    };

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Pending ID Verifications</h2>
            {loading ? (
                <p>Loading...</p>
            ) : verifications.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No pending verifications found.</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>ID Type</th>
                                    <th>ID Number</th>
                                    <th>Documents</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {verifications.map((v) => (
                                    <tr key={v.id}>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>
                                                    {v.user?.user_profile?.first_name} {v.user?.user_profile?.last_name}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{v.user?.email}</div>
                                            </div>
                                        </td>
                                        <td>{v.id_proof_type}</td>
                                        <td>{v.id_proof_number || 'N/A'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <a href={`http://localhost:8000${v.id_proof_front_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FaFileAlt /> Front
                                                </a>
                                                {v.id_proof_back_url && (
                                                    <a href={`http://localhost:8000${v.id_proof_back_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FaFileAlt /> Back
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleApprove(v.id)} className="btn btn-success" title="Approve">
                                                    <FaCheck />
                                                </button>
                                                <button onClick={() => handleReject(v.id)} className="btn btn-danger" title="Reject">
                                                    <FaTimes />
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
                        itemsPerPage={10}
                    />
                </>
            )}
        </div>
    );
}
