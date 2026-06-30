import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaImage,
    FaMoneyBillWave, FaExclamationTriangle, FaFilter, FaTimes, FaChevronDown
} from 'react-icons/fa';
import UserCell from '../components/UserCell';
import Pagination from '../components/Pagination';
import api from '../api/axios';
import { useToast } from '../components/Toast';

const statusConfig = {
    pending: { icon: FaClock, label: 'Pending', color: 'var(--warning)', bg: 'rgba(255, 183, 77, 0.15)' },
    verified: { icon: FaCheckCircle, label: 'Verified', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.15)' },
    rejected: { icon: FaTimesCircle, label: 'Rejected', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)' }
};

export default function PaymentVerifications() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const { showToast, ToastComponent } = useToast();

    const activeFilterCount = statusFilter !== 'all' ? 1 : 0;

    useEffect(() => {
        fetchVerifications(1);
    }, [search, statusFilter]);

    const fetchVerifications = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page };
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            const response = await api.get('/admin/payment-verifications', { params });
            setVerifications(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch verifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        setProcessing(true);
        try {
            await api.post(`/admin/payment-verifications/${id}/verify`);
            setConfirmAction(null);
            fetchVerifications(currentPage);
        } catch (error) {
            console.error('Failed to verify', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setProcessing(true);
        try {
            await api.post(`/admin/payment-verifications/${rejectModal}/reject`, { rejection_reason: rejectReason });
            setRejectModal(null);
            setRejectReason('');
            fetchVerifications(currentPage);
        } catch (error) {
            console.error('Failed to reject', error);
        } finally {
            setProcessing(false);
        }
    };

    const handlePageChange = (page) => {
        fetchVerifications(page);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="payment-verifications-page">
            <style>{`
                .payment-verifications-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
                .payment-verifications-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
                .payment-verifications-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
                .payment-verifications-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
                .payment-verifications-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
                .payment-verifications-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .payment-verifications-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
                .payment-verifications-page .um-cards { display: none; }
                .payment-verifications-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
                .payment-verifications-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
                .payment-verifications-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
                .payment-verifications-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
                .payment-verifications-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
                .payment-verifications-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .payment-verifications-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
                .payment-verifications-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
                .payment-verifications-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
                .payment-verifications-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
                @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
                .payment-verifications-page .um-filter-drawer { display: none; }
                @media (max-width: 768px) {
                    .payment-verifications-page .um-table-wrap { display: none; }
                    .payment-verifications-page .um-cards { display: block; }
                    .payment-verifications-page .um-filter-toggle { display: inline-flex; }
                    .payment-verifications-page .filter-bar { display: none; }
                    .payment-verifications-page .um-card-grid { grid-template-columns: 1fr; }
                    .payment-verifications-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
                    .payment-verifications-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
                    .payment-verifications-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
                }
                @media (min-width: 769px) { .payment-verifications-page .um-filter-drawer { display: none !important; } }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}><FaMoneyBillWave /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>Payment Verifications</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review payment proofs submitted by admins and credit user wallets</p>
                            </div>
                        </div>
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input type="text" placeholder="Search user..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                            <option value="all">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('all')} style={{ justifyContent: 'center' }}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('all')} style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                                <FaTimes /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="um-empty">
                        <FaMoneyBillWave />
                        <p style={{ margin: 0, fontWeight: 600 }}>No payment verification requests found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Wallet</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Proof</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Notes</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {verifications.map((item) => {
                                            const StatusIcon = statusConfig[item.status]?.icon || FaClock;
                                            const statusStyle = statusConfig[item.status] || statusConfig.pending;
                                            return (
                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <UserCell user={item.user} profile={item.user?.user_profile} avatarSize={32} />
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--success)' }}>₹{Number(item.amount).toLocaleString()}</div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text)' }}>₹{Number(item.wallet_balance || 0).toLocaleString()}</div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <button onClick={() => setPreviewImage(item.proof_image)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text)' }} title="View Proof">
                                                            <FaImage size={16} />
                                                        </button>
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.notes || <span style={{ fontStyle: 'italic' }}>No notes</span>}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color }}>
                                                            <StatusIcon size={12} /> {statusStyle.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ fontSize: '0.75rem' }}>{formatDate(item.created_at)}</div>
                                                        {item.verified_at && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Resolved: {formatDate(item.verified_at)}</div>}
                                                    </td>
                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                        {item.status === 'pending' ? (
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                <button onClick={() => setConfirmAction(item.id)}
                                                                    style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--success)', color: 'white', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer' }}>
                                                                    <FaCheckCircle size={12} style={{ marginRight: '4px' }} /> Verify
                                                                </button>
                                                                <button onClick={() => setRejectModal(item.id)}
                                                                    style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--danger)', color: 'white', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer' }}>
                                                                    <FaTimesCircle size={12} style={{ marginRight: '4px' }} /> Reject
                                                                </button>
                                                            </div>
                                                        ) : item.status === 'rejected' && item.rejection_reason ? (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer' }} title={item.rejection_reason}>
                                                                {item.rejection_reason.length > 20 ? item.rejection_reason.substring(0, 20) + '...' : item.rejection_reason}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>\u2014</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {verifications.map((item) => {
                                const StatusIcon = statusConfig[item.status]?.icon || FaClock;
                                const statusStyle = statusConfig[item.status] || statusConfig.pending;
                                return (
                                    <div className="um-card" key={item.id}>
                                        <div className="um-card-top">
                                            <UserCell user={item.user} profile={item.user?.user_profile} avatarSize={32} />
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color }}>
                                                <StatusIcon size={12} /> {statusStyle.label}
                                            </span>
                                        </div>
                                        <dl className="um-card-grid">
                                            <div>
                                                <dt>Amount</dt>
                                                <dd style={{ fontWeight: 700, color: 'var(--success)' }}>₹{Number(item.amount).toLocaleString()}</dd>
                                            </div>
                                            <div>
                                                <dt>Wallet Balance</dt>
                                                <dd style={{ fontWeight: 600 }}>₹{Number(item.wallet_balance || 0).toLocaleString()}</dd>
                                            </div>
                                            <div>
                                                <dt>Notes</dt>
                                                <dd style={{ fontSize: '0.75rem' }}>{item.notes || 'No notes'}</dd>
                                            </div>
                                            <div>
                                                <dt>Date</dt>
                                                <dd style={{ fontSize: '0.75rem' }}>{formatDate(item.created_at)}</dd>
                                            </div>
                                        </dl>
                                        <div className="um-card-actions">
                                            {item.proof_image && (
                                                <button onClick={() => setPreviewImage(item.proof_image)} className="btn btn-secondary">
                                                    <FaImage /> View Proof
                                                </button>
                                            )}
                                            {item.status === 'pending' && (
                                                <>
                                                    <button onClick={() => setConfirmAction(item.id)} className="btn btn-success">
                                                        <FaCheckCircle /> Verify
                                                    </button>
                                                    <button onClick={() => setRejectModal(item.id)} className="btn btn-danger">
                                                        <FaTimesCircle /> Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalItems} itemsPerPage={15} />
                    </>
                )}
            </div>

            {ToastComponent}

            <AnimatePresence>
                {previewImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                            src={previewImage} alt="Payment Proof"
                            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', objectFit: 'contain' }}
                            onClick={(e) => e.stopPropagation()} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmAction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Verify Payment</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>This will credit the user's wallet with the claimed amount. Have you confirmed the payment in your bank account?</p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setConfirmAction(null)} className="btn btn-secondary">Cancel</button>
                                <button onClick={() => handleVerify(confirmAction)} disabled={processing} className="btn btn-success" style={{ opacity: processing ? 0.7 : 1 }}>
                                    {processing ? 'Processing...' : 'Yes, Verify & Credit'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {rejectModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '2rem', maxWidth: '450px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Reject Verification</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Provide a reason for rejection. This will be notified to the user.</p>
                            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter rejection reason..." rows={4}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text)', resize: 'vertical', fontSize: '0.875rem', marginBottom: '1.5rem' }} />
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="btn btn-secondary">Cancel</button>
                                <button onClick={handleReject} disabled={processing || !rejectReason.trim()} className="btn btn-danger" style={{ opacity: (processing || !rejectReason.trim()) ? 0.7 : 1 }}>
                                    {processing ? 'Processing...' : 'Reject'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
