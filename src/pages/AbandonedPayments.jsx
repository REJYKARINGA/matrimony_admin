import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPhone,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaUser,
    FaReceipt,
    FaExclamationTriangle,
    FaTimesCircle,
    FaClock,
    FaWallet,
    FaCheckCircle,
    FaCopy,
    FaTimes,
    FaWhatsapp,
    FaUpload,
    FaChevronDown
} from 'react-icons/fa';
import UserCell from '../components/UserCell';
import api from '../api/axios';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
};

const statusConfig = {
    pending: { icon: FaClock, label: 'Pending', color: 'var(--warning)', bg: 'rgba(255, 183, 77, 0.15)' },
    failed: { icon: FaTimesCircle, label: 'Failed', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)' }
};

export default function AbandonedPayments() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [copiedRow, setCopiedRow] = useState(null);
    const [expandedUser, setExpandedUser] = useState(null);
    const [proofModal, setProofModal] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [proofAmount, setProofAmount] = useState('');
    const [proofNotes, setProofNotes] = useState('');
    const [proofSubmitting, setProofSubmitting] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchAbandoned(1);
    }, [search, statusFilter]);

    const fetchAbandoned = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page };
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            const response = await api.get('/admin/wallet/abandoned', { params });
            setTransactions(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch abandoned payments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupFollowUp = async (userId, status, response) => {
        try {
            const payload = { user_id: userId, follow_up_status: status };
            if (response !== undefined) payload.follow_up_response = response;
            await api.put('/admin/wallet/abandoned/follow-up', payload);
            fetchAbandoned(currentPage);
        } catch (error) {
            console.error('Failed to update follow-up', error);
        }
    };

    const handleCopy = (rowId, value) => {
        navigator.clipboard.writeText(value);
        setCopiedRow(rowId);
        setTimeout(() => setCopiedRow(null), 1500);
    };

    const handlePageChange = (page) => {
        fetchAbandoned(page);
    };

    const handleSubmitProof = async () => {
        if (!proofModal || !proofAmount) return;
        const hasExisting = proofModal.payment_verification;
        if (!proofFile && !hasExisting) return;
        setProofSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('user_id', proofModal.user.id);
            formData.append('amount', proofAmount);
            if (proofFile) {
                formData.append('proof_image', proofFile);
            } else if (hasExisting) {
                formData.append('existing_proof', hasExisting.proof_image);
            }
            if (proofNotes) formData.append('notes', proofNotes);

            await api.post('/admin/payment-verifications', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProofModal(null);
            setProofFile(null);
            setProofAmount('');
            setProofNotes('');
        } catch (error) {
            console.error('Failed to submit proof', error);
        } finally {
            setProofSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'badge-warning',
            failed: 'badge-danger'
        };
        return badges[status] || 'badge-secondary';
    };

    const activeFilterCount = statusFilter !== 'all' ? 1 : 0;

    if (!mounted) return null;

    return (
        <div className="abandoned-payments-page">
            <style>{`
                .abandoned-payments-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .abandoned-payments-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .abandoned-payments-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .abandoned-payments-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .abandoned-payments-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .abandoned-payments-page .um-filter-toggle {
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
                .abandoned-payments-page .um-filter-badge {
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
                .abandoned-payments-page .um-cards { display: none; }
                .abandoned-payments-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .abandoned-payments-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .abandoned-payments-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .abandoned-payments-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .abandoned-payments-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .abandoned-payments-page .um-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .abandoned-payments-page .um-card-actions .btn {
                    flex: 1 1 auto;
                    justify-content: center;
                    padding: 0.55rem 0.75rem;
                }
                .abandoned-payments-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .abandoned-payments-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .abandoned-payments-page .um-skel-row {
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
                .abandoned-payments-page .um-filter-drawer {
                    display: none;
                }

                @media (max-width: 768px) {
                    .abandoned-payments-page .table-container { display: none; }
                    .abandoned-payments-page .um-cards { display: block; }
                    .abandoned-payments-page .um-filter-toggle { display: inline-flex; }
                    .abandoned-payments-page .filter-bar { display: none; }
                    .abandoned-payments-page .um-filter-drawer.open {
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--hover-bg);
                    }
                    .abandoned-payments-page .um-filter-drawer select {
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
                    .abandoned-payments-page .um-filter-drawer select:focus {
                        outline: none;
                        border-color: var(--primary);
                        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18);
                    }
                    .abandoned-payments-page .um-filter-drawer .span-full {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .abandoned-payments-page .um-filter-drawer .span-full input[type="number"] {
                        width: 100% !important;
                    }
                }

                @media (min-width: 769px) {
                    .abandoned-payments-page .um-filter-drawer { display: none !important; }
                }
            `}</style>

            <motion.div
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 80%, var(--danger)20 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, var(--warning)20 0%, transparent 50%)
                    `,
                    pointerEvents: 'none', zIndex: -1
                }}
                animate={{
                    background: [
                        `radial-gradient(circle at 20% 80%, var(--danger)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--warning)20 0%, transparent 50%)`,
                        `radial-gradient(circle at 30% 70%, var(--danger)30 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, var(--warning)30 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, var(--danger)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--warning)20 0%, transparent 50%)`
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}
            >
                <motion.div
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                >
                    <FaExclamationTriangle size={32} color="var(--danger)" />
                </motion.div>
                <div>
                    <h1 style={{
                        margin: 0, fontSize: '2rem', fontWeight: 'bold',
                        color: 'var(--text-primary)'
                    }}>
                        Abandoned Payments
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Follow up with users who initiated but didn&apos;t complete payment
                    </p>
                </div>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'
                }}
            >
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Follow-up Queue</h2>

                <div className="um-search-row">
                    <div className="um-search-wrap">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search name, phone, ID..."
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

                <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    {activeFilterCount > 0 && (
                        <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('all')} style={{ justifyContent: 'center' }}>
                            Clear filters
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '16px', padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)', overflow: 'hidden'
                }}
            >
                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="um-empty">
                        <FaExclamationTriangle />
                        <p style={{ margin: 0, fontWeight: 600 }}>No abandoned payments found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Phone</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Pending</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Failed</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Balance</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Last Success</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Follow-up</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Response</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Verify Request</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {transactions.map((group, index) => {
                                                const phone = group.user_phone || group.user?.phone || '';
                                                const isExpanded = expandedUser === group.user?.id;
                                                return (
                                                    <motion.tr
                                                        key={group.user?.id || index}
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit={{ opacity: 0, x: -100 }}
                                                        whileHover="hover"
                                                        transition={{ delay: index * 0.03 }}
                                                        style={{
                                                            borderBottom: '1px solid var(--border-color)',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => setExpandedUser(isExpanded ? null : group.user?.id)}
                                                    >
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <UserCell user={group.user} profile={group.user?.user_profile} avatarSize={32} />
                                                        </td>

                                                        <td style={{ padding: '0.75rem' }}>
                                                            {phone ? (
                                                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{phone}</span>
                                                            ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>—</span>}
                                                        </td>

                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--warning)' }}>
                                                                {group.pending_count}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                                ₹{group.total_pending_amount?.toLocaleString() || '0'}
                                                            </div>
                                                        </td>

                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--danger)' }}>
                                                                {group.failed_count}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                                ₹{group.total_failed_amount?.toLocaleString() || '0'}
                                                            </div>
                                                        </td>

                                                        <td style={{ padding: '0.75rem' }}>
                                                            <div style={{
                                                                fontWeight: '600', fontSize: '0.9rem',
                                                                color: (group.wallet_balance || 0) >= (group.total_pending_amount || 0)
                                                                    ? 'var(--success)' : 'var(--danger)'
                                                            }}>
                                                                ₹{(group.wallet_balance || 0).toLocaleString()}
                                                            </div>
                                                        </td>

                                                        <td style={{ padding: '0.75rem' }}>
                                                            <div style={{ fontSize: '0.75rem' }}>
                                                                {group.last_success_payment_at
                                                                    ? formatDate(group.last_success_payment_at)
                                                                    : <span style={{ color: 'var(--text-secondary)' }}>Never</span>}
                                                            </div>
                                                        </td>

                                                        <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                            <select
                                                                value={group.follow_up_status || 'not_contacted'}
                                                                onChange={(e) => handleGroupFollowUp(group.user?.id, e.target.value, group.follow_up_response)}
                                                                style={{
                                                                    fontSize: '0.7rem', padding: '4px 6px', width: '100%', minWidth: '90px',
                                                                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                                                                    borderRadius: '6px', color: 'var(--text)', cursor: 'pointer'
                                                                }}
                                                            >
                                                                <option value="not_contacted">Not Contacted</option>
                                                                <option value="reached_out">Reached Out</option>
                                                                <option value="payment_done">Payment Done</option>
                                                                <option value="another_payment_done">Another Payment Done</option>
                                                                <option value="not_interested">Not Interested</option>
                                                                <option value="follow_up_later">Follow-up Later</option>
                                                                <option value="wrong_number">Wrong Number</option>
                                                                <option value="no_response">No Response</option>
                                                            </select>
                                                        </td>

                                                        <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                            <input
                                                                type="text"
                                                                defaultValue={group.follow_up_response || ''}
                                                                onBlur={(e) => handleGroupFollowUp(group.user?.id, group.follow_up_status || 'not_contacted', e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleGroupFollowUp(group.user?.id, group.follow_up_status || 'not_contacted', e.target.value);
                                                                }}
                                                                placeholder="Notes..."
                                                                style={{
                                                                    fontSize: '0.7rem', padding: '4px 6px', width: '100%', minWidth: '90px',
                                                                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                                                                    borderRadius: '6px', color: 'var(--text)'
                                                                }}
                                                            />
                                                        </td>

                                                        <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                            {group.payment_verification ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                                    <span style={{
                                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                        padding: '2px 8px', borderRadius: '10px',
                                                                        fontSize: '0.65rem', fontWeight: '600',
                                                                        background: group.payment_verification.status === 'verified'
                                                                            ? 'rgba(34,197,94,0.15)'
                                                                            : group.payment_verification.status === 'rejected'
                                                                            ? 'rgba(239,68,68,0.15)'
                                                                            : 'rgba(255,183,77,0.15)',
                                                                        color: group.payment_verification.status === 'verified'
                                                                            ? 'var(--success)'
                                                                            : group.payment_verification.status === 'rejected'
                                                                            ? 'var(--danger)'
                                                                            : 'var(--warning)'
                                                                    }}>
                                                                        {group.payment_verification.status}
                                                                    </span>
                                                                     {group.payment_verification.status !== 'verified' && (
                                                                         <motion.button
                                                                             whileHover={{ scale: 1.05 }}
                                                                             whileTap={{ scale: 0.95 }}
                                                                              onClick={(e) => {
                                                                                  e.stopPropagation();
                                                                                  setProofModal(group);
                                                                                  const prev = group.payment_verification;
                                                                                  setProofAmount(prev?.amount?.toString() || '');
                                                                                  setProofNotes(prev?.notes || '');
                                                                                  setProofFile(null);
                                                                              }}
                                                                             title={group.payment_verification.status === 'rejected' ? 'Re-initiate Payment Proof' : 'Update Payment Proof'}
                                                                             style={{
                                                                                 display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                                                                                 padding: '3px 8px', borderRadius: '6px',
                                                                                 background: group.payment_verification.status === 'rejected' ? 'var(--danger)' : 'var(--hover-bg)',
                                                                                 color: group.payment_verification.status === 'rejected' ? 'white' : 'var(--text)',
                                                                                 border: 'none',
                                                                                 cursor: 'pointer', fontSize: '9px', fontWeight: group.payment_verification.status === 'rejected' ? '600' : '500'
                                                                             }}
                                                                         >
                                                                             <FaUpload size={7} />
                                                                             {group.payment_verification.status === 'rejected' ? 'Re-initiate' : 'Update'}
                                                                         </motion.button>
                                                                     )}
                                                                </div>
                                                            ) : (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setProofModal(group);
                                                                        setProofAmount('');
                                                                        setProofNotes('');
                                                                        setProofFile(null);
                                                                    }}
                                                                    title="Submit Payment Proof"
                                                                    style={{
                                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                                                                        padding: '6px 12px', borderRadius: '6px',
                                                                        background: 'var(--primary)', color: 'white', border: 'none',
                                                                        cursor: 'pointer', fontSize: '10px', fontWeight: '600'
                                                                    }}
                                                                >
                                                                    <FaUpload size={9} />
                                                                    Proof
                                                                </motion.button>
                                                            )}
                                                        </td>

                                                        <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                            {phone && (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                                                                    <div style={{ display: 'flex', gap: '3px' }}>
                                                                        <motion.a href={`tel:${phone}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="Call"
                                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                                width: '26px', height: '26px', borderRadius: '6px',
                                                                                background: 'var(--success)', color: 'white', textDecoration: 'none', fontSize: '11px' }}>
                                                                            <FaPhone size={9} />
                                                                        </motion.a>
                                                                        <motion.a href={`https://wa.me/${phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                                                            target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="WhatsApp"
                                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                                width: '26px', height: '26px', borderRadius: '6px',
                                                                                background: '#25D366', color: 'white', textDecoration: 'none', fontSize: '11px' }}>
                                                                            <FaWhatsapp size={11} />
                                                                        </motion.a>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '3px' }}>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                                                            onClick={(e) => { e.stopPropagation(); handleCopy(`phone-${group.user?.id}`, phone); }}
                                                                            title="Copy Phone"
                                                                            animate={{ background: copiedRow === `phone-${group.user?.id}` ? 'var(--success)' : 'var(--card-bg)',
                                                                                color: copiedRow === `phone-${group.user?.id}` ? '#fff' : 'var(--text)' }}
                                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                                width: '26px', height: '26px', borderRadius: '6px',
                                                                                border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '9px' }}>
                                                                            {copiedRow === `phone-${group.user?.id}` ? <FaCheckCircle size={9} /> : <FaCopy size={9} />}
                                                                        </motion.button>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                                                            onClick={(e) => { e.stopPropagation(); handleCopy(`email-${group.user?.id}`, group.user_email || group.user?.email || ''); }}
                                                                            title="Copy Email"
                                                                            animate={{ background: copiedRow === `email-${group.user?.id}` ? 'var(--success)' : 'var(--card-bg)',
                                                                                color: copiedRow === `email-${group.user?.id}` ? '#fff' : 'var(--text)' }}
                                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                                width: '26px', height: '26px', borderRadius: '6px',
                                                                                border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '9px' }}>
                                                                            {copiedRow === `email-${group.user?.id}` ? <FaCheckCircle size={9} /> : <FaCopy size={9} />}
                                                                         </motion.button>
                                                                     </div>
                                                                 </div>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}

                                            {/* Expanded rows showing individual transactions */}
                                            {transactions.map((group, index) => {
                                                if (expandedUser !== group.user?.id) return null;
                                                return (
                                                    <motion.tr key={`expand-${group.user?.id}`}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <td colSpan={10} style={{ padding: 0, border: 'none' }}>
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                style={{ overflow: 'hidden' }}
                                                            >
                                                                <div style={{
                                                                    margin: '0 0.75rem 0.75rem 0.75rem',
                                                                    background: 'var(--card-bg)',
                                                                    border: '1px solid var(--border-color)',
                                                                    borderRadius: '12px',
                                                                    overflow: 'hidden',
                                                                    boxShadow: '0 2px 12px var(--shadow-color)'
                                                                }}>
                                                                    {/* Header */}
                                                                    <div style={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '70px 1fr 100px 90px 100px 120px',
                                                                        gap: '0.5rem',
                                                                        alignItems: 'center',
                                                                        padding: '0.6rem 1rem',
                                                                        background: 'var(--hover-bg)',
                                                                        borderBottom: '1px solid var(--border-color)',
                                                                        fontSize: '0.65rem', fontWeight: '600',
                                                                        color: 'var(--text-secondary)', textTransform: 'uppercase',
                                                                        letterSpacing: '0.04em'
                                                                    }}>
                                                                        <span>Status</span>
                                                                        <span>Details</span>
                                                                        <span style={{ textAlign: 'right' }}>Amount</span>
                                                                        <span>Follow-up</span>
                                                                        <span>Response</span>
                                                                        <span style={{ textAlign: 'right' }}>Date</span>
                                                                    </div>
                                                                    {group.transactions?.map((tx, txIndex) => (
                                                                        <div key={tx.id} style={{
                                                                            display: 'grid',
                                                                        gridTemplateColumns: '70px 1fr 100px 90px 100px 120px',
                                                                            gap: '0.5rem',
                                                                            alignItems: 'center',
                                                                            padding: '0.6rem 1rem',
                                                                            borderBottom: txIndex < group.transactions.length - 1
                                                                                ? '1px solid var(--border-color)' : 'none',
                                                                            fontSize: '0.8rem',
                                                                            transition: 'background 0.15s'
                                                                        }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                        >
                                                                            {/* Status */}
                                                                            <span className={`badge ${getStatusBadge(tx.status)}`}
                                                                                style={{ fontSize: '0.6rem', justifySelf: 'start' }}>
                                                                                {tx.status}
                                                                            </span>

                                                                            {/* Type + target */}
                                                                            <div>
                                                                                <div style={{ fontWeight: '600', fontSize: '0.8rem' }}>
                                                                                    {tx.type === 'wallet_recharge' ? 'Wallet Recharge' : 'Contact Unlock'}
                                                                                </div>
                                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                                                    {tx.type === 'contact_unlock' && tx.target_user
                                                                                        ? `${tx.target_user.name} (${tx.target_user.matrimony_id})`
                                                                                        : '—'}
                                                                                </div>
                                                                            </div>

                                                                            {/* Amount */}
                                                                            <div style={{ fontWeight: '700', fontSize: '0.85rem', textAlign: 'right' }}>
                                                                                ₹{tx.amount?.toLocaleString() || '0'}
                                                                            </div>

                                                                            {/* Follow-up status */}
                                                                            <div>
                                                                                <span style={{
                                                                                    display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                                                                                    fontSize: '0.6rem', fontWeight: '600',
                                                                                    background: tx.follow_up_status === 'not_contacted' || !tx.follow_up_status
                                                                                        ? 'rgba(156,163,175,0.15)' : 'rgba(34,197,94,0.15)',
                                                                                    color: tx.follow_up_status === 'not_contacted' || !tx.follow_up_status
                                                                                        ? 'var(--text-secondary)' : 'var(--success)'
                                                                                }}>
                                                                                    {tx.follow_up_status ? tx.follow_up_status.replace(/_/g, ' ') : 'Not Contacted'}
                                                                                </span>
                                                                            </div>

                                                                            {/* Response */}
                                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                                                {tx.follow_up_response || '—'}
                                                                            </div>

                                                                            {/* Date */}
                                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                                                                {formatDate(tx.created_at)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile cards */}
                        <div className="um-cards">
                            {transactions.map((group, index) => {
                                const phone = group.user_phone || group.user?.phone || '';
                                return (
                                    <div className="um-card" key={group.user?.id || index}>
                                        <div className="um-card-top">
                                            <UserCell user={group.user} profile={group.user?.user_profile} avatarSize={32} />
                                            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                                                {group.follow_up_status?.replace(/_/g, ' ') || 'Not Contacted'}
                                            </span>
                                        </div>
                                        <dl className="um-card-grid">
                                            <div>
                                                <dt>Phone</dt>
                                                <dd style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{phone || '—'}</dd>
                                            </div>
                                            <div>
                                                <dt>Pending</dt>
                                                <dd style={{ color: 'var(--warning)', fontWeight: 700 }}>{group.pending_count} / ₹{(group.total_pending_amount || 0).toLocaleString()}</dd>
                                            </div>
                                            <div>
                                                <dt>Failed</dt>
                                                <dd style={{ color: 'var(--danger)', fontWeight: 700 }}>{group.failed_count} / ₹{(group.total_failed_amount || 0).toLocaleString()}</dd>
                                            </div>
                                            <div>
                                                <dt>Balance</dt>
                                                <dd style={{ fontWeight: 600, color: (group.wallet_balance || 0) >= (group.total_pending_amount || 0) ? 'var(--success)' : 'var(--danger)' }}>₹{(group.wallet_balance || 0).toLocaleString()}</dd>
                                            </div>
                                            <div>
                                                <dt>Last Success</dt>
                                                <dd>{group.last_success_payment_at ? formatDate(group.last_success_payment_at) : <span style={{ color: 'var(--text-secondary)' }}>Never</span>}</dd>
                                            </div>
                                            <div>
                                                <dt>Response</dt>
                                                <dd>{group.follow_up_response || '—'}</dd>
                                            </div>
                                        </dl>
                                        {phone && (
                                            <div className="um-card-actions">
                                                <a href={`tel:${phone}`} className="btn btn-success" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}>
                                                    <FaPhone /> Call
                                                </a>
                                                <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleCopy(`phone-${group.user?.id}`, phone); }}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}>
                                                    {copiedRow === `phone-${group.user?.id}` ? <FaCheckCircle /> : <FaCopy />} Copy
                                                </button>
                                                <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setProofModal(group); setProofAmount(''); setProofNotes(''); setProofFile(null); }}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}>
                                                    <FaUpload /> Proof
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                marginTop: '1.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)'
                            }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem', background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)', borderRadius: '8px',
                                        color: 'var(--text)',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === 1 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </motion.button>

                                <span style={{
                                    padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white',
                                    borderRadius: '8px', fontWeight: '600'
                                }}>
                                    {currentPage} / {totalPages}
                                </span>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.5rem 1rem', background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)', borderRadius: '8px',
                                        color: 'var(--text)',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === totalPages ? 0.5 : 1
                                    }}
                                >
                                    Next
                                </motion.button>
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            {totalItems > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                >
                    Showing {transactions.length} of {totalItems} records
                </motion.div>
            )}

            {/* Submit Proof Modal */}
            <AnimatePresence>
                {proofModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { if (!proofSubmitting) setProofModal(null); }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)', borderRadius: '20px',
                                padding: '2rem', maxWidth: '480px', width: '90%',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                                Submit Payment Proof
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                                {proofModal.user?.name} — ₹{proofModal.total_pending_amount?.toLocaleString() || '0'} pending
                            </p>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                    Amount Paid (₹)
                                </label>
                                <input
                                    type="number"
                                    value={proofAmount}
                                    onChange={(e) => setProofAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    style={{
                                        width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)', color: 'var(--text)',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                    Payment Screenshot
                                </label>
                                <div
                                    onClick={() => document.getElementById('proof-upload').click()}
                                    style={{
                                        border: '2px dashed var(--border-color)', borderRadius: '12px',
                                        padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                                        background: 'var(--hover-bg)', transition: 'border-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                >
                                    {proofFile ? (
                                        <div>
                                            <img
                                                src={URL.createObjectURL(proofFile)}
                                                alt="Preview"
                                                style={{ maxHeight: '120px', borderRadius: '8px', marginBottom: '0.5rem' }}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                {proofFile.name}
                                            </p>
                                        </div>
                                    ) : proofModal?.payment_verification?.proof_image ? (
                                        <div>
                                            <img
                                                src={proofModal.payment_verification.proof_image}
                                                alt="Existing Proof"
                                                style={{ maxHeight: '120px', borderRadius: '8px', marginBottom: '0.5rem', opacity: 0.7 }}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                Existing proof — click to replace
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <FaUpload size={28} color="var(--text-secondary)" style={{ marginBottom: '0.5rem' }} />
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                Click to upload screenshot (JPEG, PNG)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        id="proof-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        onChange={(e) => setProofFile(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.4rem' }}>
                                    Notes
                                </label>
                                <textarea
                                    value={proofNotes}
                                    onChange={(e) => setProofNotes(e.target.value)}
                                    placeholder="Add notes about this payment..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--input-bg)', color: 'var(--text)',
                                        resize: 'vertical', fontSize: '0.85rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { if (!proofSubmitting) setProofModal(null); }}
                                    style={{
                                        padding: '0.6rem 1.5rem', borderRadius: '10px',
                                        border: '1px solid var(--border-color)',
                                        background: 'transparent', color: 'var(--text)',
                                        cursor: 'pointer', fontWeight: '500'
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmitProof}
                                    disabled={proofSubmitting || !proofAmount || (!proofFile && !proofModal?.payment_verification)}
                                    style={{
                                        padding: '0.6rem 1.5rem', borderRadius: '10px',
                                        border: 'none', background: 'var(--primary)', color: 'white',
                                        cursor: (proofSubmitting || !proofAmount || (!proofFile && !proofModal?.payment_verification)) ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        opacity: (proofSubmitting || !proofAmount || (!proofFile && !proofModal?.payment_verification)) ? 0.7 : 1
                                    }}
                                >
                                    {proofSubmitting ? 'Submitting...' : proofModal?.payment_verification ? 'Re-initiate Request' : 'Send Verification Request'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
