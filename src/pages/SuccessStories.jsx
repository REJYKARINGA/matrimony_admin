import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaSpinner, FaHeartBroken } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';
import { CONFIG } from '../config';

export default function SuccessStories() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: '' });
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        fetchStories(1);
    }, []);

    const fetchStories = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/success-stories', { params: { page } });
            setStories(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch stories', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchStories(page);
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/success-stories/${id}/approve`);
            fetchStories(currentPage);
        } catch (error) {
            showToast('Failed to approve', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.post(`/admin/success-stories/${id}/reject`);
            fetchStories(currentPage);
        } catch (error) {
            showToast('Failed to reject', 'error');
        }
    };

    const loadingStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        color: 'var(--text-secondary)',
        gap: '1rem'
    };

    const emptyStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        color: 'var(--text-secondary)',
        gap: '0.75rem'
    };

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Success Stories</h2>
            {loading ? (
                <div style={loadingStyle}>
                    <FaSpinner size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Loading stories...</span>
                </div>
            ) : stories.length === 0 ? (
                <div style={emptyStyle}>
                    <FaHeartBroken size={32} />
                    <span>No stories submitted.</span>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Couple</th>
                                    <th>Wedding Date</th>
                                    <th>Story</th>
                                    <th>Photo</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stories.map((story) => (
                                    <tr key={story.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <UserCell user={story.user1} profile={story.user1?.user_profile} />
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>&</span>
                                                <UserCell user={story.user2} profile={story.user2?.user_profile} />
                                            </div>
                                        </td>
                                        <td>{new Date(story.wedding_date).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ maxWidth: '300px', fontSize: '0.875rem' }} title={story.story}>
                                                {story.story.substring(0, 100)}...
                                            </div>
                                        </td>
                                        <td>
                                            {story.photo_url && (
                                                <a href={`${CONFIG.BASE_URL}${story.photo_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>
                                                    <FaExternalLinkAlt /> View
                                                </a>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${story.is_approved ? 'badge-verified' : 'badge-pending'}`}>
                                                {story.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            {!story.is_approved && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => setConfirmModal({ isOpen: true, id: story.id, action: 'approve' })} className="btn btn-success" title="Approve">
                                                        <FaCheck />
                                                    </button>
                                                    <button onClick={() => setConfirmModal({ isOpen: true, id: story.id, action: 'reject' })} className="btn btn-danger" title="Reject">
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )}
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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, action: '' })}
                onConfirm={async () => {
                    if (confirmModal.action === 'approve') {
                        await handleApprove(confirmModal.id);
                    } else if (confirmModal.action === 'reject') {
                        await handleReject(confirmModal.id);
                    }
                    setConfirmModal({ isOpen: false, id: null, action: '' });
                }}
                title={confirmModal.action === 'approve' ? 'Approve Story' : 'Reject Story'}
                message={confirmModal.action === 'approve' ? 'Approve this success story?' : 'Reject this success story?'}
                confirmText={confirmModal.action === 'approve' ? 'Approve' : 'Reject'}
                confirmButtonClass={confirmModal.action === 'approve' ? 'btn-success' : 'btn-danger'}
            />
            {ToastComponent}
        </div>
    );
}
