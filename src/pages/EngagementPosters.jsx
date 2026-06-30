import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaTrash, FaHeart, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import UserAvatar from '../components/UserAvatar';
import Pagination from '../components/Pagination';
import { CONFIG } from '../config';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';

export default function EngagementPosters() {
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const { showToast, ToastComponent } = useToast();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const activeFilterCount = search ? 1 : 0;

    const getAvatarColor = (gender) => {
        if (gender?.toLowerCase() === 'female') return '#FB419E';
        if (gender?.toLowerCase() === 'male') return '#2196F3';
        return '#9e9e9e';
    };

    const getFullImageUrl = (path) => {
        if (!path) return '';
        if (path.toString().startsWith('http')) return path;
        const cleanPath = path.toString().startsWith('/') ? path : `/${path}`;
        return `${CONFIG.BASE_URL}${cleanPath}`;
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    useEffect(() => {
        fetchPosters(1);
    }, [search]);

    const fetchPosters = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/engagement-posters', { params: { page, search } });
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
            showToast('Failed to verify', 'error');
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
            await api.delete(`/admin/engagement-posters/${id}`);
            fetchPosters(currentPage);
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    return (
        <div className="engagement-posters-page card">
            <style>{`
.engagement-posters-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
.engagement-posters-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
.engagement-posters-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
.engagement-posters-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
.engagement-posters-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
.engagement-posters-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.engagement-posters-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
.engagement-posters-page .um-cards { display: none; }
.engagement-posters-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
.engagement-posters-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
.engagement-posters-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
.engagement-posters-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
.engagement-posters-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
.engagement-posters-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.engagement-posters-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
.engagement-posters-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
.engagement-posters-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
.engagement-posters-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
@keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
.engagement-posters-page .um-filter-drawer { display: none; }
@media (max-width: 768px) {
  .engagement-posters-page .table-container { display: none; }
  .engagement-posters-page .um-cards { display: block; }
  .engagement-posters-page .um-filter-toggle { display: inline-flex; }
  .engagement-posters-page .filter-bar { display: none; }
  .engagement-posters-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
  .engagement-posters-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
  .engagement-posters-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
}
@media (min-width: 769px) { .engagement-posters-page .um-filter-drawer { display: none !important; } }
`}</style>

            <div className="um-toolbar">
                <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Engagement Posters</h2>
                <div className="um-search-row">
                    <div className="um-search-wrap">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search posters..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <button className="um-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
                        <FaFilter /> Filters {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                        <FaChevronDown size={10} style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                </div>
                <div className={`um-filter-drawer${filtersOpen ? ' open' : ''}`}>
                    <input
                        type="text"
                        placeholder="Search posters..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '1rem 0' }}>
                    {[1,2,3,4,5].map(i => <div key={i} className="um-skel-row" />)}
                </div>
            ) : posters.length === 0 ? (
                <div className="um-empty">
                    <FaHeart />
                    <p>No engagement posters submitted.</p>
                </div>
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
                                            <UserCell user={poster.user} profile={poster.user?.user_profile} />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <UserAvatar user={poster.partner} size={50} />
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
                                                    src={getFullImageUrl(poster.poster_image)} 
                                                    alt="Poster" 
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #777' }}
                                                    onClick={() => setSelectedImage(getFullImageUrl(poster.poster_image))}
                                                    onError={(e) => { e.target.style.opacity = '0.3'; e.target.title = 'Image not found'; }}
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

                    <div className="um-cards">
                        {posters.map((poster) => (
                            <div key={poster.id} className="um-card">
                                <div className="um-card-top">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <UserCell user={poster.user} profile={poster.user?.user_profile} />
                                    </div>
                                    <span className={`badge ${poster.partner_status === 'confirmed' ? 'badge-verified' : poster.partner_status === 'rejected' ? 'badge-danger' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                                        {poster.partner_status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>
                                <dl className="um-card-grid">
                                    <div>
                                        <dt>Partner ID</dt>
                                        <dd>{poster.partner_matrimony_id}</dd>
                                    </div>
                                    <div>
                                        <dt>Engagement Date</dt>
                                        <dd>{new Date(poster.engagement_date).toLocaleDateString()}</dd>
                                    </div>
                                    <div>
                                        <dt>Title</dt>
                                        <dd>{poster.announcement_title || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt>Verified</dt>
                                        <dd><span className={`badge ${poster.is_verified ? 'badge-verified' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>{poster.is_verified ? 'Verified' : 'Pending'}</span></dd>
                                    </div>
                                </dl>
                                <div className="um-card-actions">
                                    {!poster.is_verified && poster.partner_status === 'confirmed' && (
                                        <button onClick={() => confirmVerify(poster.id)} className="btn btn-success" title="Mark Verified">
                                            <FaCheck /> Verify
                                        </button>
                                    )}
                                    <button onClick={() => confirmDelete(poster.id)} className="btn btn-danger" title="Delete">
                                        <FaTrash /> Delete
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
                        itemsPerPage={20}
                    />
                </>
            )}

            {ToastComponent}

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
                        <p style={{ marginBottom: '1.5rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
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
