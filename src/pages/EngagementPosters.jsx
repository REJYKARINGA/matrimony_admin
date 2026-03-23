import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaTrash, FaUser, FaHeart } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import { CONFIG } from '../config';

export default function EngagementPosters() {
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

    const getAvatarColor = (gender) => {
        if (gender?.toLowerCase() === 'female') return '#FB419E'; // Soft Pink
        if (gender?.toLowerCase() === 'male') return '#2196F3'; // Bright Blue
        return '#9e9e9e'; // Gray default
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    useEffect(() => {
        fetchPosters(1);
    }, []);

    const fetchPosters = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/engagement-posters', { params: { page } });
            setPosters(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch engagement posters', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchPosters(page);
    };

    const confirmVerify = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Verify Poster',
            message: 'Are you sure you want to verify this engagement poster?',
            isDanger: false,
            onConfirm: () => handleVerify(id)
        });
    };

    const confirmDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Poster',
            message: 'Are you sure you want to completely delete this engagement poster? This action cannot be undone.',
            isDanger: true,
            onConfirm: () => handleDelete(id)
        });
    };

    const handleVerify = async (id) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
            await api.post(`/admin/engagement-posters/${id}/verify`);
            fetchPosters(currentPage);
        } catch (error) {
            alert('Failed to verify');
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
            await api.delete(`/admin/engagement-posters/${id}`);
            fetchPosters(currentPage);
        } catch (error) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Engagement Posters</h2>
            {loading ? (
                <p>Loading...</p>
            ) : posters.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No engagement posters submitted.</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Partner ID</th>
                                    <th>Engagement Date</th>
                                    <th>Title</th>
                                    <th>Photo</th>
                                    <th>Partner Status</th>
                                    <th>Verified</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posters.map((poster) => (
                                    <tr key={poster.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ flexShrink: 0 }}>
                                                    {poster.user?.user_profile?.profile_picture ? (
                                                        <img 
                                                            src={poster.user.user_profile.profile_picture.startsWith('http') ? poster.user.user_profile.profile_picture : `${CONFIG.BASE_URL}${poster.user.user_profile.profile_picture}`} 
                                                            alt="User" 
                                                            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)', padding: '2px' }}
                                                        />
                                                    ) : (
                                                        <div style={{ 
                                                            width: '50px', 
                                                            height: '50px', 
                                                            borderRadius: '50%', 
                                                            background: getAvatarColor(poster.user?.user_profile?.gender), 
                                                            color: 'white',
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.2rem',
                                                            border: '2px solid white',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                        }}>
                                                            {getInitials(poster.user?.user_profile?.first_name || poster.user?.email)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>
                                                        {poster.user?.user_profile?.first_name || poster.user?.email || 'N/A'} 
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'gray' }}>
                                                        {poster.user?.matrimony_id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ flexShrink: 0 }}>
                                                    {poster.partner?.user_profile?.profile_picture ? (
                                                        <img 
                                                            src={poster.partner.user_profile.profile_picture.startsWith('http') ? poster.partner.user_profile.profile_picture : `${CONFIG.BASE_URL}${poster.partner.user_profile.profile_picture}`} 
                                                            alt="Partner" 
                                                            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--secondary-color, #ec4899)', padding: '2px' }}
                                                        />
                                                    ) : (
                                                        <div style={{ 
                                                            width: '50px', 
                                                            height: '50px', 
                                                            borderRadius: '50%', 
                                                            background: getAvatarColor(poster.partner?.user_profile?.gender), 
                                                            color: 'white',
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.2rem',
                                                            border: '2px solid white',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                        }}>
                                                            {getInitials(poster.partner?.user_profile?.first_name || poster.partner_matrimony_id)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{poster.partner_matrimony_id}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                                                        {poster.partner?.user_profile?.first_name ? `${poster.partner.user_profile.first_name} ${poster.partner.user_profile.last_name || ''}` : 'Pending Account'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{new Date(poster.engagement_date).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ maxWidth: '200px', fontSize: '0.875rem' }} title={poster.announcement_message}>
                                                {poster.announcement_title}
                                            </div>
                                        </td>
                                        <td>
                                            {poster.poster_image && (
                                                <img 
                                                    src={poster.poster_image.startsWith('http') ? poster.poster_image : `${CONFIG.BASE_URL}${poster.poster_image}`} 
                                                    alt="Poster" 
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #eee' }}
                                                    onClick={() => setSelectedImage(poster.poster_image.startsWith('http') ? poster.poster_image : `${CONFIG.BASE_URL}${poster.poster_image}`)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${poster.partner_status === 'confirmed' ? 'badge-verified' : poster.partner_status === 'rejected' ? 'badge-danger' : 'badge-pending'}`}>
                                                {poster.partner_status?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${poster.is_verified ? 'badge-verified' : 'badge-pending'}`}>
                                                {poster.is_verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {!poster.is_verified && poster.partner_status === 'confirmed' && (
                                                    <button onClick={() => confirmVerify(poster.id)} className="btn btn-success" title="Mark Verified">
                                                        <FaCheck />
                                                    </button>
                                                )}
                                                <button onClick={() => confirmDelete(poster.id)} className="btn btn-danger" title="Delete">
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
                        itemsPerPage={20}
                    />
                </>
            )}

            {/* Image Modal */}
            {selectedImage && createPortal(
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999999,
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <button 
                            onClick={() => setSelectedImage(null)}
                            style={{ 
                                position: 'absolute', 
                                top: '-40px', 
                                right: '0', 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'white', 
                                fontSize: '24px', 
                                cursor: 'pointer' 
                            }}
                        >
                            <FaTimes />
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Full Size Poster" 
                            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }} 
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* Custom Confirm Modal */}
            {confirmModal.isOpen && createPortal(
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999999,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                >
                    <div 
                        style={{ 
                            background: 'var(--card-bg)', 
                            borderRadius: '12px', 
                            padding: '1.5rem', 
                            width: '400px', 
                            maxWidth: '90%',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            color: 'var(--text)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: confirmModal.isDanger ? '#ef4444' : 'var(--text)' }}>
                            {confirmModal.title}
                        </h3>
                        <p style={{ marginBottom: '1.5rem', alignLine: 1.5, color: 'var(--text-secondary)' }}>
                            {confirmModal.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button 
                                className="btn" 
                                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text)' }}
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                            >
                                Cancel
                            </button>
                            <button 
                                className={`btn ${confirmModal.isDanger ? 'btn-danger' : 'btn-success'}`}
                                onClick={confirmModal.onConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
