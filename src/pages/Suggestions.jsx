import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { createPortal } from 'react-dom';
import ConfirmModal from '../components/ConfirmModal';
import {
    LuLightbulb, LuSearch, LuTrash2, LuX, LuClock,
    LuLoader, LuCircleCheck, LuCircleX, LuChevronLeft,
    LuChevronRight, LuTerminal, LuRocket, LuEye, LuMessageSquare,
    LuGitPullRequest, LuZap, LuImage, LuPaperclip, LuDownload
} from 'react-icons/lu';
import { FaChevronDown } from 'react-icons/fa';
import UserCell from '../components/UserCell';
import { useToast } from '../components/Toast';

const STATUS_CONFIG = {
    pending:     { label: 'Under Review',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <LuClock size={12} />,       devLabel: 'Needs triage'        },
    in_progress: { label: 'In Development',  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: <LuTerminal size={12} />,    devLabel: 'Being implemented'   },
    completed:   { label: 'Shipped \u2713',       color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: <LuCircleCheck size={12} />, devLabel: 'Live in app'         },
    rejected:    { label: 'Declined',        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <LuCircleX size={12} />,     devLabel: 'Will not implement'  },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`, whiteSpace: 'nowrap' }}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

function ReviewModal({ suggestion, onClose, onSaved }) {
    const [status, setStatus] = useState(suggestion.status);
    const [devNotes, setDevNotes] = useState(suggestion.response_text || '');
    const [devPhoto, setDevPhoto] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('status', status);
            formData.append('response_text', devNotes);
            if (devPhoto) formData.append('response_photo', devPhoto);
            await api.post(`/admin/suggestions/${suggestion.id}/respond`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update.');
        } finally { setSaving(false); }
    };

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    const modal = (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-content" style={{ background: 'var(--card-bg)', borderRadius: '20px', width: '100%', maxWidth: '560px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', animation: 'modalSlideUp 0.3s ease' }}>
                <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}><LuGitPullRequest size={18} /></div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Developer Review</h3>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Update implementation status and add developer notes</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn" style={{ width: 32, height: 32 }}><LuX size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="suggestion-form" style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ background: 'var(--hover-bg)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border-color)' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Feature Request</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{suggestion.title}</p>
                        {suggestion.description && (<p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{suggestion.description}</p>)}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <LuMessageSquare size={12} /> Submitted by: <UserCell user={suggestion.user} profile={suggestion.user?.user_profile} avatarSize={20} showBadge={false} />
                        </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Implementation Status</label>
                        <div className="status-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.65rem 0.9rem', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${status === key ? val.color : 'var(--border-color)'}`, background: status === key ? val.bg : 'transparent', transition: 'all 0.2s' }}>
                                    <input type="radio" name="status" value={key} checked={status === key} onChange={() => setStatus(key)} style={{ display: 'none' }} />
                                    <span style={{ color: val.color }}>{val.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: status === key ? val.color : 'var(--text)' }}>{val.label}</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{val.devLabel}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Developer Notes</label>
                        <textarea className="form-control" value={devNotes} onChange={e => setDevNotes(e.target.value)} rows={4}
                            placeholder={`e.g. "Planned for v2.3 sprint. Needs backend schema changes..."`}
                            style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, fontSize: '0.875rem' }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Attach Screenshot/Mockup (Optional)</label>
                        <div className="upload-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.85rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text)' }}>
                                <LuPaperclip size={14} /> {devPhoto ? 'Change File' : 'Choose File'}
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if(e.target.files && e.target.files.length > 0) setDevPhoto(e.target.files[0]); }} />
                            </label>
                            {devPhoto && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{devPhoto.name}</span>}
                        </div>
                        {suggestion.response_photo && !devPhoto && (
                            <div style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                                <a href={suggestion.response_photo.startsWith('http') ? suggestion.response_photo : `http://localhost:8000${suggestion.response_photo}`} target="_blank" rel="noreferrer" style={{ color: '#6366F1', display: 'flex', alignItems: 'center', gap: 4 }}><LuImage size={12} /> View currently attached photo</a>
                            </div>
                        )}
                    </div>
                    {suggestion.user_photos && Array.isArray(suggestion.user_photos) && suggestion.user_photos.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>User Attached Screenshots</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {suggestion.user_photos.map((photo, j) => {
                                    const imgUrl = photo.startsWith('http') ? photo : `http://localhost:8000${photo}`;
                                    return (
                                        <a key={j} href={imgUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                                            <img src={imgUrl} alt={`Attachment ${j}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {error && <p style={{ margin: 0, color: '#EF4444', fontSize: '0.82rem' }}>{error}</p>}
                    <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LuRocket size={14} /> {saving ? 'Saving...' : 'Update Status'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
    return createPortal(modal, document.body);
}

export default function Suggestions() {
    const [suggestions, setSuggestions] = useState([]);
    const [stats, setStats]       = useState({});
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage]         = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal]       = useState(0);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { showToast, ToastComponent } = useToast();

    const activeFilterCount = statusFilter !== 'all' ? 1 : 0;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, search, status: statusFilter });
            const res = await api.get(`/admin/suggestions?${params}`);
            setSuggestions(res.data.data || []);
            setStats(res.data.stats || {});
            setLastPage(res.data.last_page || 1);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error('Failed to fetch suggestions', err);
        } finally { setLoading(false); }
    }, [page, search, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async () => {
        if (!confirmModal.id) return;
        setDeleting(confirmModal.id);
        try {
            await api.delete(`/admin/suggestions/${confirmModal.id}`);
            fetchData();
        } catch { showToast('Failed to delete.', 'error'); }
        finally { setDeleting(null); setConfirmModal({ isOpen: false, id: null }); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014';

    const statCards = [
        { label: 'Total Requests', value: stats.total || 0,       color: '#6366F1', icon: <LuLightbulb size={18} />,  filter: 'all'         },
        { label: 'Under Review',   value: stats.pending || 0,     color: '#F59E0B', icon: <LuEye size={18} />,        filter: 'pending'     },
        { label: 'In Development', value: stats.in_progress || 0, color: '#3B82F6', icon: <LuTerminal size={18} />,  filter: 'in_progress' },
        { label: 'Shipped',        value: stats.completed || 0,   color: '#10B981', icon: <LuZap size={18} />,       filter: 'completed'   },
        { label: 'Declined',       value: stats.rejected || 0,    color: '#EF4444', icon: <LuCircleX size={18} />,   filter: 'rejected'    },
    ];

    return (
        <div className="suggestions-page">
            <style>{`
                .suggestions-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
                .suggestions-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
                .suggestions-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
                .suggestions-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
                .suggestions-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
                .suggestions-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .suggestions-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
                .suggestions-page .um-cards { display: none; }
                .suggestions-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
                .suggestions-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
                .suggestions-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
                .suggestions-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
                .suggestions-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
                .suggestions-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .suggestions-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
                .suggestions-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
                .suggestions-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
                .suggestions-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
                @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
                .suggestions-page .um-filter-drawer { display: none; }
                @media (max-width: 768px) {
                    .suggestions-page .um-table-wrap { display: none; }
                    .suggestions-page .um-cards { display: block; }
                    .suggestions-page .um-filter-toggle { display: inline-flex; }
                    .suggestions-page .filter-bar { display: none; }
                    .suggestions-page .um-card-grid { grid-template-columns: 1fr; }
                    .suggestions-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
                    .suggestions-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
                    .suggestions-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
                }
                @media (min-width: 769px) { .suggestions-page .um-filter-drawer { display: none !important; } }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', fontSize: '1.2rem' }}><LuLightbulb /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>Feature Requests</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ideas & suggestions submitted by users</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid-5" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {statCards.map(card => (
                            <div key={card.label} className="card" onClick={() => { setStatusFilter(card.filter); setPage(1); }}
                                style={{ padding: '1rem 1.25rem', cursor: 'pointer', borderLeft: `3px solid ${card.color}`, outline: statusFilter === card.filter ? `2px solid ${card.color}` : 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</p>
                                    <span style={{ color: card.color, opacity: 0.7 }}>{card.icon}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <LuSearch size={15} />
                            <input type="text" placeholder="Search by feature title, user name, email..." value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                        <button type="button" className="um-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
                            {filtersOpen ? <LuX /> : <LuSearch />}
                            Filters
                            {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                            <option value="all">Status: All</option>
                            <option value="pending">Under Review</option>
                            <option value="in_progress">In Development</option>
                            <option value="completed">Shipped</option>
                            <option value="rejected">Declined</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => { setStatusFilter('all'); setPage(1); }} style={{ justifyContent: 'center' }}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                            <option value="all">Status: All</option>
                            <option value="pending">Under Review</option>
                            <option value="in_progress">In Development</option>
                            <option value="completed">Shipped</option>
                            <option value="rejected">Declined</option>
                        </select>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{total} request{total !== 1 ? 's' : ''}</span>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => { setStatusFilter('all'); setPage(1); }} style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                                <LuX /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Need to import FaChevronDown */}
                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="um-empty">
                        <LuLightbulb />
                        <p style={{ margin: 0, fontWeight: 600 }}>No feature requests found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Users haven't submitted any suggestions yet, or try adjusting your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: 36 }}>#</th>
                                            <th>User</th>
                                            <th>Feature Request</th>
                                            <th>Status</th>
                                            <th>Developer Notes</th>
                                            <th>Submitted</th>
                                            <th style={{ textAlign: 'center', width: 100 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suggestions.map((s, i) => (
                                            <tr key={s.id}>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{(page - 1) * 15 + i + 1}</td>
                                                <td><UserCell user={s.user} profile={s.user?.user_profile} /></td>
                                                <td style={{ maxWidth: 300 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: 3 }}>{s.title}</div>
                                                    {s.category && (<span style={{ display: 'inline-block', marginBottom: 4, padding: '2px 8px', background: '#F3F4F6', color: '#4B5563', fontSize: '0.7rem', fontWeight: 600, borderRadius: 4 }}>{s.category}</span>)}
                                                    {s.description && (<div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{s.description}</div>)}
                                                </td>
                                                <td><StatusBadge status={s.status} /></td>
                                                <td style={{ maxWidth: 220 }}>
                                                    {s.response_text ? (
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, background: 'var(--hover-bg)', padding: '4px 8px', borderRadius: 6, borderLeft: '2px solid #6366F1' }}>{s.response_text}</div>
                                                    ) : (<span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.45, fontStyle: 'italic' }}>No dev notes yet</span>)}
                                                </td>
                                                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(s.created_at)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                        <button className="icon-btn edit" title="Review & Update Status" onClick={() => setReviewTarget(s)}><LuTerminal size={14} /></button>
                                                        <button className="icon-btn delete" title="Delete Request" onClick={() => setConfirmModal({ isOpen: true, id: s.id })} disabled={deleting === s.id}>
                                                            {deleting === s.id ? <LuLoader size={13} /> : <LuTrash2 size={13} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {suggestions.map((s, i) => (
                                <div className="um-card" key={s.id}>
                                    <div className="um-card-top">
                                        <UserCell user={s.user} profile={s.user?.user_profile} />
                                        <StatusBadge status={s.status} />
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{s.title}</div>
                                    {s.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.description}</div>}
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Category</dt>
                                            <dd>{s.category || '\u2014'}</dd>
                                        </div>
                                        <div>
                                            <dt>Submitted</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{formatDate(s.created_at)}</dd>
                                        </div>
                                        <div>
                                            <dt>Dev Notes</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{s.response_text || 'No dev notes yet'}</dd>
                                        </div>
                                    </dl>
                                    <div className="um-card-actions">
                                        <button className="btn btn-primary" title="Review & Update Status" onClick={() => setReviewTarget(s)}>
                                            <LuTerminal size={12} /> Review
                                        </button>
                                        <button className="btn btn-danger" title="Delete Request" onClick={() => setConfirmModal({ isOpen: true, id: s.id })} disabled={deleting === s.id}>
                                            {deleting === s.id ? <LuLoader size={12} /> : <LuTrash2 size={12} />} Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {lastPage > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><LuChevronLeft size={16} /></button>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Page {page} / {lastPage}</span>
                                <button className="icon-btn" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}><LuChevronRight size={16} /></button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {ToastComponent}
            {reviewTarget && (<ReviewModal suggestion={reviewTarget} onClose={() => setReviewTarget(null)} onSaved={fetchData} />)}
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null })} onConfirm={handleDelete}
                title="Delete Feature Request" message="Are you sure you want to delete this feature request? This action cannot be undone."
                confirmButtonClass="btn-danger" isLoading={deleting === confirmModal.id} />
        </div>
    );
}
