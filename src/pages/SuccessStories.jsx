import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaSpinner, FaHeartBroken, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
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
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [search, setSearch] = useState('');
    const { showToast, ToastComponent } = useToast();

    const activeFilterCount = 0;

    useEffect(() => {
        fetchStories(1);
    }, [search]);

    const fetchStories = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/success-stories', { params: { page, search: search || undefined } });
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

    return (
        <div className="success-stories-page">
            <style>{`
                .success-stories-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
                .success-stories-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
                .success-stories-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
                .success-stories-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
                .success-stories-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
                .success-stories-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .success-stories-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
                .success-stories-page .um-cards { display: none; }
                .success-stories-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
                .success-stories-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
                .success-stories-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
                .success-stories-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
                .success-stories-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
                .success-stories-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .success-stories-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
                .success-stories-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
                .success-stories-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
                .success-stories-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
                @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
                .success-stories-page .um-filter-drawer { display: none; }
                @media (max-width: 768px) {
                    .success-stories-page .table-container { display: none; }
                    .success-stories-page .um-cards { display: block; }
                    .success-stories-page .um-filter-toggle { display: inline-flex; }
                    .success-stories-page .filter-bar { display: none; }
                    .success-stories-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
                    .success-stories-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
                    .success-stories-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
                }
                @media (min-width: 769px) { .success-stories-page .um-filter-drawer { display: none !important; } }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Success Stories</h2>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search stories..."
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

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`} />
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : stories.length === 0 ? (
                    <div className="um-empty">
                        <FaHeartBroken />
                        <p style={{ margin: 0, fontWeight: 600 }}>No stories found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{search ? 'Try adjusting your search.' : 'No stories have been submitted yet.'}</p>
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

                        <div className="um-cards">
                            {stories.map((story) => (
                                <div className="um-card" key={story.id}>
                                    <div className="um-card-top">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                            <UserCell user={story.user1} profile={story.user1?.user_profile} />
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem' }}>&</span>
                                            <UserCell user={story.user2} profile={story.user2?.user_profile} />
                                        </div>
                                        <span className={`badge ${story.is_approved ? 'badge-verified' : 'badge-pending'}`} style={{ flexShrink: 0 }}>
                                            {story.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Wedding Date</dt>
                                            <dd>{new Date(story.wedding_date).toLocaleDateString()}</dd>
                                        </div>
                                        <div>
                                            <dt>Photo</dt>
                                            <dd>{story.photo_url ? <a href={`${CONFIG.BASE_URL}${story.photo_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}><FaExternalLinkAlt /> View</a> : '—'}</dd>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <dt>Story</dt>
                                            <dd style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>{story.story.substring(0, 150)}...</dd>
                                        </div>
                                    </dl>
                                    {!story.is_approved && (
                                        <div className="um-card-actions">
                                            <button onClick={() => setConfirmModal({ isOpen: true, id: story.id, action: 'approve' })} className="btn btn-success">
                                                <FaCheck /> Approve
                                            </button>
                                            <button onClick={() => setConfirmModal({ isOpen: true, id: story.id, action: 'reject' })} className="btn btn-danger">
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
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
