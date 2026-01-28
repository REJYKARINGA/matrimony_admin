import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import Pagination from '../components/Pagination';

export default function SuccessStories() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

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
        if (!window.confirm('Approve this story?')) return;
        try {
            await api.post(`/admin/success-stories/${id}/approve`);
            fetchStories(currentPage);
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this story?')) return;
        try {
            await api.post(`/admin/success-stories/${id}/reject`);
            fetchStories(currentPage);
        } catch (error) {
            alert('Failed to reject');
        }
    };

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Success Stories</h2>
            {loading ? (
                <p>Loading...</p>
            ) : stories.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No stories submitted.</p>
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
                                            <div style={{ fontWeight: '600' }}>
                                                {story.user1?.user_profile?.first_name} & {story.user2?.user_profile?.first_name}
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
                                                <a href={`http://localhost:8000${story.photo_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>
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
                                                    <button onClick={() => handleApprove(story.id)} className="btn btn-success" title="Approve">
                                                        <FaCheck />
                                                    </button>
                                                    <button onClick={() => handleReject(story.id)} className="btn btn-danger" title="Reject">
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
        </div>
    );
}
