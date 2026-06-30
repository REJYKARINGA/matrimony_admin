import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { FaCheckCircle, FaTimes, FaShieldAlt, FaBan, FaUnlock, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import TimeFormatCell from '../components/TimeFormatCell';
import ConfirmModal from '../components/ConfirmModal';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [participants, setParticipants] = useState({ reporters: [], reported: [] });
    const [reporterSearch, setReporterSearch] = useState('');
    const [reportedSearch, setReportedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { showToast, ToastComponent } = useToast();

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: '', message: '', userId: null });
    const [resolvingReport, setResolvingReport] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    const activeFilterCount = statusFilter !== 'all' ? 1 : 0;

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const response = await api.get('/admin/reports/participants');
            setParticipants(response.data);
        } catch (error) {
            console.error('Failed to fetch participants', error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchReports(1);
        }, 500); 
        return () => clearTimeout(timeoutId);
    }, [statusFilter, reporterSearch, reportedSearch, sortBy, sortDir]);

    const fetchReports = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/reports', { 
                params: { 
                    page, 
                    reporter_search: reporterSearch,
                    reported_search: reportedSearch,
                    status: statusFilter,
                    sort_by: sortBy,
                    sort_dir: sortDir
                } 
            });
            setReports(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReports(1);
    };

    const handlePageChange = (page) => {
        fetchReports(page);
    };

    const handleResolveClick = (report) => {
        setResolvingReport(report);
        setResolutionNotes('');
    };

    const submitResolution = async () => {
        if (!resolutionNotes.trim()) return;
        try {
            setIsResolving(true);
            await api.post(`/admin/reports/${resolvingReport.id}/resolve`, { resolution_notes: resolutionNotes });
            setResolvingReport(null);
            fetchReports(currentPage);
        } catch (error) {
            showToast('Failed to resolve', 'error');
        } finally {
            setIsResolving(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!confirmModal.userId) {
            showToast('Cannot perform action: Reported User data is missing or inaccessible.', 'error');
            setConfirmModal({ isOpen: false, id: null, action: '', message: '', userId: null });
            return;
        }
        try {
            await api.post(`/admin/users/${confirmModal.userId}/toggle-block`, {
                block_reason: blockReason || undefined
            });
            fetchReports(currentPage);
        } catch (error) {
            console.error('Action failed:', error);
            showToast('Failed to perform action', 'error');
        } finally {
            setConfirmModal({ isOpen: false, id: null, action: '', message: '', userId: null });
            setBlockReason('');
        }
    };

    const openBlockConfirm = (report) => {
        const isBlocked = report.reported?.status === 'blocked';
        const reportedUser = report.reported;
        const profile = reportedUser?.user_profile || reportedUser?.userProfile;
        const name = profile?.first_name || reportedUser?.matrimony_id || 'this user';
        setBlockReason('');
        setConfirmModal({
            isOpen: true, id: report.id, userId: reportedUser?.id, action: 'toggleBlock',
            message: isBlocked ? `Are you sure you want to unblock ${name}?` : `You are about to block ${name}. All users who interact with this profile will be notified. Reason for blocking:`,
            isBlocked: isBlocked,
            suggestions: isBlocked ? [] : [report.reason, 'Fake Profile', 'Harassment', 'Indecent Content', 'Scammer/Fraud', 'Commercial Activity', 'Repeated non-response'].filter(Boolean)
        });
    };

    return (
        <div className="reports-page">
            <style>{`
                .reports-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
                .reports-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
                .reports-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .reports-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
                .reports-page .um-cards { display: none; }
                .reports-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
                .reports-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
                .reports-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
                .reports-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
                .reports-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
                .reports-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .reports-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
                .reports-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
                .reports-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
                .reports-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
                @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
                .reports-page .um-filter-drawer { display: none; }
                @media (max-width: 768px) {
                    .reports-page .um-table-wrap { display: none; }
                    .reports-page .um-cards { display: block; }
                    .reports-page .um-filter-toggle { display: inline-flex; }
                    .reports-page .filter-bar { display: none; }
                    .reports-page .um-card-grid { grid-template-columns: 1fr; }
                    .reports-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
                    .reports-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
                    .reports-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
                }
                @media (min-width: 769px) { .reports-page .um-filter-drawer { display: none !important; } }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: '1.2rem' }}><FaShieldAlt /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>User Reports</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage and review community reports</p>
                            </div>
                        </div>
                    </div>

                    <div className="tabs-scroll" style={{ marginBottom: '0.75rem' }}>
                        {['all', 'pending', 'resolved'].map((status) => (
                            <button key={status} onClick={() => setStatusFilter(status)}
                                style={{ color: statusFilter === status ? 'var(--primary)' : 'inherit', fontWeight: statusFilter === status ? '700' : '400', borderBottom: statusFilter === status ? '2px solid var(--primary)' : 'none', textTransform: 'capitalize', opacity: statusFilter === status ? 1 : 0.6 }}>
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="um-search-row">
                        <button type="button" className="um-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
                            {filtersOpen ? <FaTimes /> : <FaFilter />}
                            Filters
                            {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        <select value={`${sortBy}-${sortDir}`} onChange={(e) => { const [by, dir] = e.target.value.split('-'); setSortBy(by); setSortDir(dir); }}>
                            <option value="created_at-desc">Sort: Newest</option>
                            <option value="created_at-asc">Sort: Oldest</option>
                            <option value="name-asc">Sort: Reporter Name (A-Z)</option>
                            <option value="name-desc">Sort: Reporter Name (Z-A)</option>
                        </select>
                        <input type="text" placeholder="Search Reporter..." list="reporter-list-mobile"
                            value={reporterSearch} onChange={(e) => setReporterSearch(e.target.value)} />
                        <datalist id="reporter-list-mobile">
                            {participants.reporters?.map(p => (<option key={p.id} value={p.matrimony_id}>{p.user_profile?.first_name} {p.user_profile?.last_name}</option>))}
                        </datalist>
                        <input type="text" placeholder="Search Reported..." list="reported-list-mobile"
                            value={reportedSearch} onChange={(e) => setReportedSearch(e.target.value)} />
                        <datalist id="reported-list-mobile">
                            {participants.reported?.map(p => (<option key={p.id} value={p.matrimony_id}>{p.user_profile?.first_name} {p.user_profile?.last_name}</option>))}
                        </datalist>
                        <button onClick={handleSearch} className="btn btn-primary" style={{ justifyContent: 'center' }}>Search</button>
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <select value={`${sortBy}-${sortDir}`} onChange={(e) => { const [by, dir] = e.target.value.split('-'); setSortBy(by); setSortDir(dir); }} style={{ fontWeight: '500' }}>
                            <option value="created_at-desc">Sort: Newest</option>
                            <option value="created_at-asc">Sort: Oldest</option>
                            <option value="name-asc">Sort: Reporter Name (A-Z)</option>
                            <option value="name-desc">Sort: Reporter Name (Z-A)</option>
                        </select>
                        <input type="text" placeholder="Search Reporter..." list="reporter-list"
                            value={reporterSearch} onChange={(e) => setReporterSearch(e.target.value)} />
                        <datalist id="reporter-list">
                            {participants.reporters?.map(p => (<option key={p.id} value={p.matrimony_id}>{p.user_profile?.first_name} {p.user_profile?.last_name}</option>))}
                        </datalist>
                        <input type="text" placeholder="Search Reported..." list="reported-list"
                            value={reportedSearch} onChange={(e) => setReportedSearch(e.target.value)} />
                        <datalist id="reported-list">
                            {participants.reported?.map(p => (<option key={p.id} value={p.matrimony_id}>{p.user_profile?.first_name} {p.user_profile?.last_name}</option>))}
                        </datalist>
                        <button onClick={handleSearch} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Search</button>
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : reports.length === 0 ? (
                    <div className="um-empty">
                        <FaShieldAlt />
                        <p style={{ margin: 0, fontWeight: 600 }}>No reports found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>All community reports have been resolved.</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Reporter</th>
                                            <th>Reported User</th>
                                            <th>Reason</th>
                                            <th style={{ width: '25%' }}>Resolution Notes</th>
                                            <th>Status</th>
                                            <th>Reviewed By/At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((report) => (
                                            <tr key={report.id}>
                                                <td><UserCell user={report.reporter} profile={report.reporter?.user_profile || report.reporter?.userProfile} /></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <UserCell user={report.reported} profile={report.reported?.user_profile || report.reported?.userProfile} showBadge={false} />
                                                        <span className={`badge ${report.reported?.status === 'blocked' ? 'badge-rejected' : 'badge-verified'}`} style={{ fontSize: '0.65rem', padding: '1px 4px' }}>{report.reported?.status}</span>
                                                        {report.reported?.received_user_reports_count > 1 && (
                                                            <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                                Total Reports: {report.reported?.received_user_reports_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>{report.reason}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}><TimeFormatCell date={report.created_at} /></div>
                                                </td>
                                                <td>
                                                    <div style={{ maxWidth: '250px', fontSize: '0.875rem' }}>
                                                        {report.resolution_notes || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>N/A</span>}
                                                    </div>
                                                </td>
                                                <td><span className={`badge ${report.status === 'pending' ? 'badge-pending' : 'badge-verified'}`}>{report.status}</span></td>
                                                <td>
                                                    {report.status !== 'pending' && report.reviewed_at ? (
                                                        <><div>{report.reviewer?.user_profile?.first_name || 'System'}</div><div style={{ fontSize: '0.75rem', opacity: 0.6 }}><TimeFormatCell date={report.reviewed_at} /></div></>
                                                    ) : (<span style={{ opacity: 0.5 }}>\u2014</span>)}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {report.status === 'pending' && (
                                                            <button onClick={() => handleResolveClick(report)} className="btn btn-success" title="Resolve"><FaCheckCircle /> Resolve</button>
                                                        )}
                                                        <button onClick={() => openBlockConfirm(report)} className={`btn ${report.reported?.status === 'blocked' ? 'btn-success' : 'btn-danger'}`}
                                                            title={report.reported?.status === 'blocked' ? 'Unblock User' : 'Block User'} style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                                                            {report.reported?.status === 'blocked' ? <FaUnlock /> : <FaBan />}{report.reported?.status === 'blocked' ? ' Unblock' : ' Block'}
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
                            {reports.map((report) => (
                                <div className="um-card" key={report.id}>
                                    <div className="um-card-top">
                                        <UserCell user={report.reporter} profile={report.reporter?.user_profile || report.reporter?.userProfile} />
                                        <span className={`badge ${report.status === 'pending' ? 'badge-pending' : 'badge-verified'}`}>{report.status}</span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <dt>Reported User</dt>
                                            <dd>
                                                <UserCell user={report.reported} profile={report.reported?.user_profile || report.reported?.userProfile} showBadge={false} />
                                                <span className={`badge ${report.reported?.status === 'blocked' ? 'badge-rejected' : 'badge-verified'}`} style={{ fontSize: '0.6rem', padding: '1px 4px', marginLeft: '0.5rem' }}>{report.reported?.status}</span>
                                            </dd>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <dt>Reason</dt>
                                            <dd>{report.reason}</dd>
                                        </div>
                                        <div>
                                            <dt>Reported At</dt>
                                            <dd style={{ fontSize: '0.75rem' }}><TimeFormatCell date={report.created_at} /></dd>
                                        </div>
                                        <div>
                                            <dt>Resolution Notes</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{report.resolution_notes || 'N/A'}</dd>
                                        </div>
                                    </dl>
                                    <div className="um-card-actions">
                                        {report.status === 'pending' && (
                                            <button onClick={() => handleResolveClick(report)} className="btn btn-success"><FaCheckCircle /> Resolve</button>
                                        )}
                                        <button onClick={() => openBlockConfirm(report)} className={`btn ${report.reported?.status === 'blocked' ? 'btn-success' : 'btn-danger'}`}>
                                            {report.reported?.status === 'blocked' ? <FaUnlock /> : <FaBan />}{report.reported?.status === 'blocked' ? ' Unblock' : ' Block'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalItems} itemsPerPage={10} />
                    </>
                )}
            </div>

            {resolvingReport && createPortal(
                <AnimatePresence mode="wait">
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setResolvingReport(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
                        <motion.div key="modal" initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{ position: 'relative', width: '100%', maxWidth: '480px', background: 'var(--card-bg)', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Resolve Report</h3>
                                <button onClick={() => setResolvingReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, color: 'inherit' }}><FaTimes size={18} /></button>
                            </div>
                            <div style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '0.88rem', marginBottom: '2rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                    <div style={{ color: '#EF4444', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Issue Reported</div>
                                    <div style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.5 }}>"{resolvingReport.reason}"</div>
                                </div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Resolution Notes</label>
                                <textarea autoFocus placeholder="Briefly explain what action was taken..." value={resolutionNotes}
                                    onChange={e => setResolutionNotes(e.target.value)}
                                    style={{ width: '100%', minHeight: '130px', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', resize: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
                            </div>
                            <div style={{ padding: '1.5rem 2rem', background: 'var(--hover-bg)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setResolvingReport(null)} className="btn" style={{ fontWeight: '600', opacity: 0.7 }}>Cancel</button>
                                <button onClick={submitResolution} className="btn btn-success" disabled={!resolutionNotes.trim() || isResolving} style={{ padding: '0.75rem 2rem', fontWeight: '700' }}>
                                    {isResolving ? 'Processing...' : 'Complete Resolution'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>, document.body
            )}

            {ToastComponent}
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, action: '', message: '', userId: null })}
                onConfirm={handleToggleBlock} title="Confirm Action" message={confirmModal.message}
                confirmButtonClass={confirmModal.isBlocked ? 'btn-success' : 'btn-danger'}
                showInput={confirmModal.action === 'toggleBlock' && !confirmModal.isBlocked}
                inputPlaceholder="Enter blocking reason (e.g. Repeated non-response, Fraud)" inputValue={blockReason}
                onInputChange={setBlockReason} suggestions={confirmModal.suggestions} />
        </div>
    );
}
