import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaTimes as FaClose } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';

export default function Verifications() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null });
    const [rejectReason, setRejectReason] = useState('');

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

    const handleApprove = async () => {
        try {
            await api.post(`/admin/verifications/${confirmModal.id}/approve`);
            fetchVerifications(currentPage);
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        try {
            await api.post(`/admin/verifications/${confirmModal.id}/reject`, { reason: rejectReason });
            fetchVerifications(currentPage);
            setRejectReason('');
        } catch (error) {
            alert('Failed to reject');
        }
    };

    return (
        <>
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
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <img
                                                        src={`http://localhost:8000${v.id_proof_front_url}`}
                                                        alt="Front ID"
                                                        onClick={() => setPreviewImage({ url: `http://localhost:8000${v.id_proof_front_url}`, title: 'ID Proof - Front' })}
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            objectFit: 'cover',
                                                            borderRadius: '0.375rem',
                                                            cursor: 'pointer',
                                                            border: '2px solid var(--border-color)',
                                                            transition: 'transform 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    />
                                                    {v.id_proof_back_url && (
                                                        <img
                                                            src={`http://localhost:8000${v.id_proof_back_url}`}
                                                            alt="Back ID"
                                                            onClick={() => setPreviewImage({ url: `http://localhost:8000${v.id_proof_back_url}`, title: 'ID Proof - Back' })}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '0.375rem',
                                                                cursor: 'pointer',
                                                                border: '2px solid var(--border-color)',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => setConfirmModal({ isOpen: true, type: 'approve', id: v.id })} className="btn btn-success" title="Approve">
                                                        <FaCheck />
                                                    </button>
                                                    <button onClick={() => setConfirmModal({ isOpen: true, type: 'reject', id: v.id })} className="btn btn-danger" title="Reject">
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

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1002,
                        padding: '2rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            background: 'var(--card-bg)',
                            borderRadius: '1rem',
                            overflow: 'hidden',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: 'var(--text)' }}>{previewImage.title}</h3>
                            <button
                                onClick={() => setPreviewImage(null)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FaClose />
                            </button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <img
                                src={previewImage.url}
                                alt={previewImage.title}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 'calc(90vh - 120px)',
                                    objectFit: 'contain',
                                    display: 'block',
                                    margin: '0 auto'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => {
                    setConfirmModal({ isOpen: false, type: null, id: null });
                    setRejectReason('');
                }}
                onConfirm={confirmModal.type === 'approve' ? handleApprove : handleReject}
                title={confirmModal.type === 'approve' ? 'Approve Verification' : 'Reject Verification'}
                message={confirmModal.type === 'approve'
                    ? 'Are you sure you want to approve this user\'s ID verification?'
                    : 'Please provide a reason for rejecting this verification.'}
                confirmText={confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
                confirmButtonClass={confirmModal.type === 'approve' ? 'btn-success' : 'btn-danger'}
                showInput={confirmModal.type === 'reject'}
                inputPlaceholder="Enter rejection reason..."
                inputValue={rejectReason}
                onInputChange={setRejectReason}
            />
        </>
    );
}
