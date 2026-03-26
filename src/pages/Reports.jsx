import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { FaCheckCircle, FaTimes, FaShieldAlt } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import TimeFormatCell from '../components/TimeFormatCell';

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

    const [resolvingReport, setResolvingReport] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    const handleResolveClick = (report) => {
        setResolvingReport(report);
        setResolutionNotes('');
        setResolvingReport(report);
    };

    const submitResolution = async () => {
        if (!resolutionNotes.trim()) return;
        try {
            setIsResolving(true);
            await api.post(`/admin/reports/${resolvingReport.id}/resolve`, { resolution_notes: resolutionNotes });
            setResolvingReport(null);
            fetchReports(currentPage);
        } catch (error) {
            alert('Failed to resolve');
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>User Reports</h2>
                    <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>Manage and review community reports</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <select
                        value={`${sortBy}-${sortDir}`}
                        onChange={(e) => {
                            const [by, dir] = e.target.value.split('-');
                            setSortBy(by);
                            setSortDir(dir);
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.25rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: '500',
                            height: '35px'
                        }}
                    >
                        <option value="created_at-desc">Sort: Newest</option>
                        <option value="created_at-asc">Sort: Oldest</option>
                        <option value="updated_at-desc">Sort: Last Updated</option>
                        <option value="name-asc">Sort: Reporter Name (A-Z)</option>
                        <option value="name-desc">Sort: Reporter Name (Z-A)</option>
                    </select>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Search Reporter..." 
                                className="form-control"
                                list="reporter-list"
                                value={reporterSearch}
                                onChange={(e) => setReporterSearch(e.target.value)}
                                style={{ width: '180px', fontSize: '0.85rem' }}
                            />
                            <datalist id="reporter-list">
                                {participants.reporters?.map(p => (
                                    <option key={p.id} value={p.matrimony_id}>
                                        {p.user_profile?.first_name} {p.user_profile?.last_name}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Search Reported..." 
                                className="form-control"
                                list="reported-list"
                                value={reportedSearch}
                                onChange={(e) => setReportedSearch(e.target.value)}
                                style={{ width: '180px', fontSize: '0.85rem' }}
                            />
                            <datalist id="reported-list">
                                {participants.reported?.map(p => (
                                    <option key={p.id} value={p.matrimony_id}>
                                        {p.user_profile?.first_name} {p.user_profile?.last_name}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Search</button>
                    </form>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {['all', 'pending', 'resolved'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            color: statusFilter === status ? 'var(--primary)' : 'inherit',
                            fontWeight: statusFilter === status ? '700' : '400',
                            borderBottom: statusFilter === status ? '2px solid var(--primary)' : 'none',
                            textTransform: 'capitalize',
                            fontSize: '0.9rem',
                            opacity: statusFilter === status ? 1 : 0.6
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : reports.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No reports found.</p>
            ) : (
                <>
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
                                        <td>
                                            <div>{report.reporter?.user_profile?.first_name} {report.reporter?.user_profile?.last_name}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ID: {report.reporter?.matrimony_id}</div>
                                        </td>
                                        <td>
                                            <div>{report.reported?.user_profile?.first_name} {report.reported?.user_profile?.last_name}</div>
                                            <div style={{ fontSize: '0.75rem', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                                                <span style={{ opacity: 0.6 }}>ID: {report.reported?.matrimony_id}</span>
                                                {report.reported?.received_user_reports_count > 1 && (
                                                    <span style={{ 
                                                        background: 'rgba(239, 68, 68, 0.1)', 
                                                        color: '#EF4444', 
                                                        padding: '1px 6px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '0.65rem',
                                                        fontWeight: '700',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)'
                                                    }}>
                                                        Total Reports: {report.reported?.received_user_reports_count}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div>{report.reason}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                                <TimeFormatCell date={report.created_at} />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '250px', fontSize: '0.875rem' }}>
                                                {report.resolution_notes || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>N/A</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${report.status === 'pending' ? 'badge-pending' : 'badge-verified'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>
                                            {report.status !== 'pending' && report.reviewed_at ? (
                                                <>
                                                    <div>{report.reviewer?.user_profile?.first_name || 'System'}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                                        <TimeFormatCell date={report.reviewed_at} />
                                                    </div>
                                                </>
                                            ) : (
                                                <span style={{ opacity: 0.5 }}>—</span>
                                            )}
                                        </td>
                                        <td>
                                            {report.status === 'pending' && (
                                                <button onClick={() => handleResolveClick(report)} className="btn btn-success" title="Resolve">
                                                    <FaCheckCircle /> Resolve
                                                </button>
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

            {/* Resolution Modal */}
            {resolvingReport && createPortal(
                <AnimatePresence mode="wait">
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100vw', 
                        height: '100vh', 
                        zIndex: 9999, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '1rem' 
                    }}>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setResolvingReport(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} 
                        />
                        <motion.div 
                            key="modal"
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{ 
                                position: 'relative', width: '100%', maxWidth: '480px', 
                                background: 'var(--card-bg)', borderRadius: '20px', 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden'
                            }}
                        >
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
                                <textarea 
                                    autoFocus
                                    placeholder="Briefly explain what action was taken..."
                                    value={resolutionNotes}
                                    onChange={e => setResolutionNotes(e.target.value)}
                                    style={{ width: '100%', minHeight: '130px', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', resize: 'none', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                            <div style={{ padding: '1.5rem 2rem', background: 'var(--hover-bg)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setResolvingReport(null)} className="btn" style={{ fontWeight: '600', opacity: 0.7 }}>Cancel</button>
                                <button 
                                    onClick={submitResolution} 
                                    className="btn btn-success" 
                                    disabled={!resolutionNotes.trim() || isResolving}
                                    style={{ padding: '0.75rem 2rem', fontWeight: '700' }}
                                >
                                    {isResolving ? 'Processing...' : 'Complete Resolution'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
