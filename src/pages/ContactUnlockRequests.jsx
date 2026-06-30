import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { contactUnlockRequestApi } from '../api/contactUnlockRequestApi';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { FaArrowRight, FaSearch, FaFilter, FaCalendarAlt, FaCheck, FaTimes, FaHourglassHalf, FaUnlock, FaChevronDown } from 'react-icons/fa';
import UserCell from '../components/UserCell';
import { useToast } from '../components/Toast';

export default function ContactUnlockRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: '' });
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { showToast, ToastComponent } = useToast();

    const activeFilterCount = statusFilter !== '' ? 1 : 0;

    const fetchRequests = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, search };
            if (statusFilter) params.status = statusFilter;
            const response = await contactUnlockRequestApi.getRequests(params);
            setRequests(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setTotalPages(response.data.last_page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch unlock requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(1);
    }, [search, statusFilter]);

    const handleRespond = async () => {
        if (!confirmModal.id) return;
        try {
            const response = await contactUnlockRequestApi.respondToRequest(confirmModal.id, confirmModal.action);
            showToast(response.data.message);
            setConfirmModal({ open: false, id: null, action: '' });
            fetchRequests(currentPage);
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to respond', 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const statusBadge = (status) => {
        const styles = {
            pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
            approved: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
            rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {status === 'pending' && <FaHourglassHalf size={12} />}
                {status === 'approved' && <FaCheck size={12} />}
                {status === 'rejected' && <FaTimes size={12} />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="contact-unlock-requests-page">
            <style>{`
                .contact-unlock-requests-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .contact-unlock-requests-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .contact-unlock-requests-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .contact-unlock-requests-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .contact-unlock-requests-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .contact-unlock-requests-page .um-filter-toggle {
                    display: none;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1.5px solid var(--border-color);
                    background: var(--card-bg);
                    color: var(--text);
                    border-radius: 10px;
                    padding: 0.55rem 0.9rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .contact-unlock-requests-page .um-filter-badge {
                    background: var(--primary);
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.68rem;
                    min-width: 18px;
                    height: 18px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 5px;
                }
                .contact-unlock-requests-page .um-cards { display: none; }
                .contact-unlock-requests-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .contact-unlock-requests-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .contact-unlock-requests-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .contact-unlock-requests-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .contact-unlock-requests-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .contact-unlock-requests-page .um-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .contact-unlock-requests-page .um-card-actions .btn {
                    flex: 1 1 auto;
                    justify-content: center;
                    padding: 0.55rem 0.75rem;
                }
                .contact-unlock-requests-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .contact-unlock-requests-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .contact-unlock-requests-page .um-skel-row {
                    height: 56px;
                    border-radius: 10px;
                    margin-bottom: 0.6rem;
                    background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%);
                    background-size: 400% 100%;
                    animation: um-shimmer 1.4s ease infinite;
                }
                @keyframes um-shimmer {
                    0% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
                .contact-unlock-requests-page .um-filter-drawer {
                    display: none;
                }
                @media (max-width: 768px) {
                    .contact-unlock-requests-page .um-table-wrap { display: none; }
                    .contact-unlock-requests-page .um-cards { display: block; }
                    .contact-unlock-requests-page .um-filter-toggle { display: inline-flex; }
                    .contact-unlock-requests-page .filter-bar { display: none; }
                    .contact-unlock-requests-page .um-card-grid { grid-template-columns: 1fr; }
                    .contact-unlock-requests-page .um-filter-drawer.open {
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--hover-bg);
                    }
                    .contact-unlock-requests-page .um-filter-drawer select {
                        width: 100%;
                        appearance: none;
                        -webkit-appearance: none;
                        background-color: var(--card-bg);
                        color: var(--text);
                        border: 1.5px solid var(--border-color);
                        border-radius: 10px;
                        padding: 0.7rem 2.25rem 0.7rem 0.9rem;
                        font-size: 0.85rem;
                        font-weight: 500;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-position: right 0.85rem center;
                        background-size: 1.1rem;
                    }
                    .contact-unlock-requests-page .um-filter-drawer select:focus {
                        outline: none;
                        border-color: var(--primary);
                        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18);
                    }
                }
                @media (min-width: 769px) {
                    .contact-unlock-requests-page .um-filter-drawer { display: none !important; }
                }
            `}</style>

            <div className="card" style={{ padding: 0 }}>
                <div className="um-toolbar" style={{ padding: '1.25rem 1.5rem 0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}><FaUnlock /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>Contact Unlock Requests</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review and manage user requests to unlock contact details</p>
                            </div>
                        </div>
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input type="text" placeholder="Search by name, matrimony ID or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <button type="button" className="um-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
                            {filtersOpen ? <FaTimes /> : <FaFilter />}
                            Filters
                            {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('')} style={{ justifyContent: 'center' }}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                            <FaFilter size={14} />
                            <span style={{ fontSize: '0.9rem' }}>{totalItems} Results</span>
                        </div>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('')} style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                                <FaTimes /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '1.5rem' }}>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="um-empty">
                        <FaUnlock />
                        <p style={{ margin: 0, fontWeight: 600 }}>No unlock requests found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                    <thead style={{ background: 'var(--sidebar-bg)' }}>
                                        <tr>
                                            <th style={{ padding: '1.25rem 1.5rem' }}>Requester</th>
                                            <th style={{ textAlign: 'center' }}></th>
                                            <th>Target User</th>
                                            <th style={{ textAlign: 'center' }}>Status</th>
                                            <th style={{ textAlign: 'center' }}>Responded At</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                            <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Requested At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((item, index) => (
                                            <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                                                style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <UserCell user={item.requester} profile={item.requester?.user_profile} />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ color: 'var(--primary)', opacity: 0.5 }}><FaArrowRight /></div>
                                                </td>
                                                <td>
                                                    <UserCell user={item.target_user} profile={item.target_user?.user_profile} />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{statusBadge(item.status)}</td>
                                                <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {formatDate(item.responded_at)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {item.status === 'pending' ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                            <button className="icon-btn success" title="Approve"
                                                                onClick={() => setConfirmModal({ open: true, id: item.id, action: 'approved' })}>
                                                                <FaCheck />
                                                            </button>
                                                            <button className="icon-btn delete" title="Reject"
                                                                onClick={() => setConfirmModal({ open: true, id: item.id, action: 'rejected' })}>
                                                                <FaTimes />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>--</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                        <FaCalendarAlt size={12} />
                                                        {formatDate(item.created_at)}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {requests.map((item, index) => (
                                <div className="um-card" key={item.id}>
                                    <div className="um-card-top">
                                        <UserCell user={item.requester} profile={item.requester?.user_profile} />
                                        {statusBadge(item.status)}
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Target User</dt>
                                            <dd><UserCell user={item.target_user} profile={item.target_user?.user_profile} /></dd>
                                        </div>
                                        <div>
                                            <dt>Requested On</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{formatDate(item.created_at)}</dd>
                                        </div>
                                        <div>
                                            <dt>Responded At</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{formatDate(item.responded_at)}</dd>
                                        </div>
                                    </dl>
                                    {item.status === 'pending' && (
                                        <div className="um-card-actions">
                                            <button className="btn btn-success" title="Approve"
                                                onClick={() => setConfirmModal({ open: true, id: item.id, action: 'approved' })}>
                                                <FaCheck /> Approve
                                            </button>
                                            <button className="btn btn-danger" title="Reject"
                                                onClick={() => setConfirmModal({ open: true, id: item.id, action: 'rejected' })}>
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--card-bg)' }}>
                            <Pagination currentPage={currentPage} totalPages={totalPages}
                                onPageChange={(page) => fetchRequests(page)} totalItems={totalItems} itemsPerPage={20} />
                        </div>
                    </>
                )}
            </div>

            {ToastComponent}

            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, id: null, action: '' })}
                onConfirm={handleRespond}
                title={confirmModal.action === 'approved' ? 'Approve Request' : 'Reject Request'}
                message={'Are you sure you want to ' + confirmModal.action + ' this unlock request?'}
                confirmText={confirmModal.action === 'approved' ? 'Approve' : 'Reject'}
                confirmButtonClass={confirmModal.action === 'approved' ? 'btn-success' : 'btn-danger'}
            />
        </div>
    );
}
