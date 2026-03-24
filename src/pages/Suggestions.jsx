import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { createPortal } from 'react-dom';
import {
    LuLightbulb, LuSearch, LuTrash2, LuX, LuClock,
    LuLoader, LuCircleCheck, LuCircleX, LuChevronLeft,
    LuChevronRight, LuTerminal, LuRocket, LuEye, LuMessageSquare,
    LuGitPullRequest, LuZap
} from 'react-icons/lu';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending:     { label: 'Under Review',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <LuClock size={12} />,       devLabel: 'Needs triage'        },
    in_progress: { label: 'In Development',  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: <LuTerminal size={12} />,    devLabel: 'Being implemented'   },
    completed:   { label: 'Shipped ✓',       color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: <LuCircleCheck size={12} />, devLabel: 'Live in app'         },
    rejected:    { label: 'Declined',        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: <LuCircleX size={12} />,     devLabel: 'Will not implement'  },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '3px 10px', borderRadius: '20px',
            fontSize: '0.72rem', fontWeight: 700,
            color: cfg.color, background: cfg.bg,
            border: `1px solid ${cfg.color}33`,
            whiteSpace: 'nowrap',
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

// ─── Review / Dev Notes Modal ─────────────────────────────────────────────────
function ReviewModal({ suggestion, onClose, onSaved }) {
    const [status, setStatus] = useState(suggestion.status);
    const [devNotes, setDevNotes] = useState(suggestion.response_text || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.put(`/admin/suggestions/${suggestion.id}/respond`, {
                status,
                response_text: devNotes,
            });
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update.');
        } finally {
            setSaving(false);
        }
    };

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    const modal = (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        }}>
            <div style={{
                background: 'var(--card-bg)', borderRadius: '20px', width: '100%', maxWidth: '560px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)', border: '1px solid var(--border-color)',
                animation: 'modalSlideUp 0.3s ease',
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                            <LuGitPullRequest size={18} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Developer Review</h3>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Update implementation status and add developer notes</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn" style={{ width: 32, height: 32 }}><LuX size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Feature request preview */}
                    <div style={{ background: 'var(--hover-bg)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border-color)' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Feature Request</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{suggestion.title}</p>
                        {suggestion.description && (
                            <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{suggestion.description}</p>
                        )}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <LuMessageSquare size={12} />
                            Submitted by: <strong style={{ color: 'var(--text)' }}>
                                {suggestion.user?.user_profile
                                    ? `${suggestion.user.user_profile.first_name || ''} ${suggestion.user.user_profile.last_name || ''}`.trim()
                                    : suggestion.user?.email}
                            </strong>
                        </div>
                    </div>

                    {/* Implementation Status */}
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Implementation Status</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                <label key={key} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '0.65rem 0.9rem', borderRadius: 10, cursor: 'pointer',
                                    border: `1.5px solid ${status === key ? val.color : 'var(--border-color)'}`,
                                    background: status === key ? val.bg : 'transparent',
                                    transition: 'all 0.2s',
                                }}>
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

                    {/* Developer Notes */}
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Developer Notes</label>
                        <textarea
                            className="form-control"
                            value={devNotes}
                            onChange={e => setDevNotes(e.target.value)}
                            rows={4}
                            placeholder={`e.g. "Planned for v2.3 sprint. Needs backend schema changes..." or "Duplicate of #42. Closing in favour of existing ticket."`}
                            style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, fontSize: '0.875rem' }}
                        />
                    </div>

                    {error && <p style={{ margin: 0, color: '#EF4444', fontSize: '0.82rem' }}>{error}</p>}

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <LuRocket size={14} /> {saving ? 'Saving...' : 'Update Status'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
    return createPortal(modal, document.body);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feature request permanently?')) return;
        setDeleting(id);
        try {
            await api.delete(`/admin/suggestions/${id}`);
            fetchData();
        } catch {
            alert('Failed to delete.');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    const statCards = [
        { label: 'Total Requests', value: stats.total || 0,       color: '#6366F1', icon: <LuLightbulb size={18} />,  filter: 'all'         },
        { label: 'Under Review',   value: stats.pending || 0,     color: '#F59E0B', icon: <LuEye size={18} />,        filter: 'pending'     },
        { label: 'In Development', value: stats.in_progress || 0, color: '#3B82F6', icon: <LuTerminal size={18} />,  filter: 'in_progress' },
        { label: 'Shipped',        value: stats.completed || 0,   color: '#10B981', icon: <LuZap size={18} />,       filter: 'completed'   },
        { label: 'Declined',       value: stats.rejected || 0,    color: '#EF4444', icon: <LuCircleX size={18} />,   filter: 'rejected'    },
    ];

    return (
        <div className="page-content">
            {/* Page Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', flexShrink: 0, border: '1px solid rgba(99,102,241,0.25)' }}>
                            <LuLightbulb size={26} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Feature Requests</h1>
                            <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Ideas &amp; suggestions submitted by users — your product backlog from real users
                            </p>
                        </div>
                    </div>
                    {/* Developer tip badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366F1', fontSize: '0.78rem', fontWeight: 600 }}>
                        <LuGitPullRequest size={14} />  Review &amp; track user-requested features
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {statCards.map(card => (
                    <div
                        key={card.label}
                        className="card"
                        onClick={() => { setStatusFilter(card.filter); setPage(1); }}
                        style={{
                            padding: '1.1rem 1.25rem', cursor: 'pointer',
                            borderLeft: `3px solid ${card.color}`,
                            outline: statusFilter === card.filter ? `2px solid ${card.color}` : 'none',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                            <span style={{ color: card.color, opacity: 0.7 }}>{card.icon}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 240px' }}>
                    <LuSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by feature title, user name, email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: '2.25rem', margin: 0 }}
                    />
                </div>
                <select className="form-control" style={{ width: 'auto', margin: 0 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Statuses</option>
                    <option value="pending">Under Review</option>
                    <option value="in_progress">In Development</option>
                    <option value="completed">Shipped</option>
                    <option value="rejected">Declined</option>
                </select>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{total} request{total !== 1 ? 's' : ''}</span>
            </div>

            {/* Feature Requests Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <LuLoader size={24} style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.4, animation: 'spin 1s linear infinite' }} />
                                    Loading feature requests...
                                </td></tr>
                            ) : suggestions.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)' }}>
                                    <LuLightbulb size={40} style={{ display: 'block', margin: '0 auto 0.75rem', opacity: 0.3 }} />
                                    <p style={{ margin: 0, fontWeight: 600 }}>No feature requests found</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>Users haven't submitted any suggestions yet, or try adjusting your filters.</p>
                                </td></tr>
                            ) : suggestions.map((s, i) => {
                                const profile = s.user?.user_profile;
                                const name = profile
                                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                                    : s.user?.email || '—';
                                const subInfo = s.user?.matrimony_id || s.user?.email || '';

                                return (
                                    <tr key={s.id}>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{(page - 1) * 15 + i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{name}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{subInfo}</div>
                                        </td>
                                        <td style={{ maxWidth: 300 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', marginBottom: 3 }}>{s.title}</div>
                                            {s.description && (
                                                <div style={{
                                                    fontSize: '0.78rem', color: 'var(--text-secondary)',
                                                    display: '-webkit-box', WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5
                                                }}>{s.description}</div>
                                            )}
                                        </td>
                                        <td><StatusBadge status={s.status} /></td>
                                        <td style={{ maxWidth: 220 }}>
                                            {s.response_text ? (
                                                <div style={{
                                                    fontSize: '0.78rem', color: 'var(--text-secondary)',
                                                    display: '-webkit-box', WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5,
                                                    background: 'var(--hover-bg)', padding: '4px 8px', borderRadius: 6,
                                                    borderLeft: '2px solid #6366F1',
                                                }}>{s.response_text}</div>
                                            ) : (
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.45, fontStyle: 'italic' }}>No dev notes yet</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(s.created_at)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                <button
                                                    className="icon-btn edit"
                                                    title="Review & Update Status"
                                                    onClick={() => setReviewTarget(s)}
                                                >
                                                    <LuCode2 size={14} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete Request"
                                                    onClick={() => handleDelete(s.id)}
                                                    disabled={deleting === s.id}
                                                >
                                                    {deleting === s.id ? <LuLoader size={13} /> : <LuTrash2 size={13} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><LuChevronLeft size={16} /></button>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Page {page} / {lastPage}</span>
                        <button className="icon-btn" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}><LuChevronRight size={16} /></button>
                    </div>
                )}
            </div>

            {reviewTarget && (
                <ReviewModal
                    suggestion={reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    onSaved={fetchData}
                />
            )}
        </div>
    );
}
