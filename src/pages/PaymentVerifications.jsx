import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaImage,
    FaMoneyBillWave, FaExclamationTriangle, FaUser, FaCopy
} from 'react-icons/fa';
import UserCell from '../components/UserCell';
import api from '../api/axios';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.15 }
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
    const [mounted, setMounted] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            await api.post(`/admin/payment-verifications/${rejectModal}/reject`, {
                rejection_reason: rejectReason,
            });
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

    if (!mounted) return null;

    return (
        <div style={{ padding: '2rem', position: 'relative' }}>
            <motion.div
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 80%, var(--success)20 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, var(--warning)20 0%, transparent 50%)
                    `,
                    pointerEvents: 'none', zIndex: -1
                }}
                animate={{
                    background: [
                        `radial-gradient(circle at 20% 80%, var(--success)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--warning)20 0%, transparent 50%)`,
                        `radial-gradient(circle at 30% 70%, var(--success)30 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, var(--warning)30 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, var(--success)20 0%, transparent 50%),
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
                    <FaMoneyBillWave size={32} color="var(--primary)" />
                </motion.div>
                <div>
                    <h1 style={{
                        margin: 0, fontSize: '2rem', fontWeight: 'bold',
                        color: 'var(--text-primary)'
                    }}>
                        Payment Verifications
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Review payment proofs submitted by admins and credit user wallets
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
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Verification Queue</h2>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                paddingLeft: '40px', width: '250px', marginBottom: 0,
                                background: 'var(--card-bg)', border: '1px solid var(--border-color)'
                            }}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem', background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)', borderRadius: '0.5rem',
                            color: 'var(--text)', cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
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
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'inline-block' }}
                        >
                            <FaExclamationTriangle size={32} color="var(--primary)" />
                        </motion.div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
                    </div>
                ) : (
                    <>
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
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Re-initiated</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Verified By</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {verifications.map((item, index) => {
                                            const StatusIcon = statusConfig[item.status]?.icon || FaClock;
                                            const statusStyle = statusConfig[item.status] || statusConfig.pending;
                                            return (
                                                <motion.tr
                                                    key={item.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -100 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                                >
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <UserCell user={item.user} profile={item.user?.user_profile} avatarSize={32} />
                                                    </td>

                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--success)' }}>
                                                            ₹{Number(item.amount).toLocaleString()}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text)' }}>
                                                            ₹{Number(item.wallet_balance || 0).toLocaleString()}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setPreviewImage(item.proof_image)}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                width: '36px', height: '36px', borderRadius: '8px',
                                                                background: 'var(--hover-bg)', border: '1px solid var(--border-color)',
                                                                cursor: 'pointer', color: 'var(--text)'
                                                            }}
                                                            title="View Proof"
                                                        >
                                                            <FaImage size={16} />
                                                        </motion.button>
                                                    </td>

                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.notes || <span style={{ fontStyle: 'italic' }}>No notes</span>}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                            padding: '4px 12px', borderRadius: '20px',
                                                            fontSize: '0.75rem', fontWeight: '600',
                                                            background: statusStyle.bg, color: statusStyle.color
                                                        }}>
                                                            <StatusIcon size={12} />
                                                            {statusStyle.label}
                                                        </span>
                                                    </td>

                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        {item.is_reinitiated ? (
                                                            <span style={{
                                                                fontSize: '0.65rem', fontWeight: '600',
                                                                color: 'var(--warning)', background: 'rgba(255,183,77,0.12)',
                                                                padding: '2px 8px', borderRadius: '6px'
                                                            }}>
                                                                Yes
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>—</span>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: '0.75rem' }}>
                                                        {item.verified_by && item.verifier ? (
                                                            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                                                                {[
                                                                    item.verifier.user_profile?.first_name,
                                                                    item.verifier.user_profile?.last_name,
                                                                ].filter(Boolean).join(' ') || item.verifier.email}
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>—</span>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ fontSize: '0.75rem' }}>
                                                            {formatDate(item.created_at)}
                                                        </div>
                                                        {item.verified_at && (
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                                Resolved: {formatDate(item.verified_at)}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                        {item.status === 'pending' ? (
                                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setConfirmAction(item.id)}
                                                                    style={{
                                                                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                                                                        background: 'var(--success)', color: 'white',
                                                                        fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <FaCheckCircle size={12} style={{ marginRight: '4px' }} />
                                                                    Verify
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setRejectModal(item.id)}
                                                                    style={{
                                                                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                                                                        background: 'var(--danger)', color: 'white',
                                                                        fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <FaTimesCircle size={12} style={{ marginRight: '4px' }} />
                                                                    Reject
                                                                </motion.button>
                                                            </div>
                                                        ) : item.status === 'rejected' && item.rejection_reason ? (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                                                title={item.rejection_reason}>
                                                                {item.rejection_reason.length > 20
                                                                    ? item.rejection_reason.substring(0, 20) + '...'
                                                                    : item.rejection_reason}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>—</span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {verifications.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <FaExclamationTriangle size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>No verification requests found</p>
                            </div>
                        )}

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
                    Showing {verifications.length} of {totalItems} records
                </motion.div>
            )}

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={previewImage}
                            alt="Payment Proof"
                            style={{
                                maxWidth: '90%', maxHeight: '90%', borderRadius: '12px',
                                objectFit: 'contain'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Verify Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                            style={{
                                background: 'var(--card-bg)', borderRadius: '20px',
                                padding: '2rem', maxWidth: '400px', width: '90%',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Verify Payment</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                This will credit the user's wallet with the claimed amount. Have you confirmed the payment in your bank account?
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setConfirmAction(null)}
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
                                    onClick={() => handleVerify(confirmAction)}
                                    disabled={processing}
                                    style={{
                                        padding: '0.6rem 1.5rem', borderRadius: '10px',
                                        border: 'none', background: 'var(--success)', color: 'white',
                                        cursor: processing ? 'not-allowed' : 'pointer', fontWeight: '600',
                                        opacity: processing ? 0.7 : 1
                                    }}
                                >
                                    {processing ? 'Processing...' : 'Yes, Verify & Credit'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {rejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                            style={{
                                background: 'var(--card-bg)', borderRadius: '20px',
                                padding: '2rem', maxWidth: '450px', width: '90%',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Reject Verification</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Provide a reason for rejection. This will be notified to the user.
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows={4}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--input-bg)', color: 'var(--text)',
                                    resize: 'vertical', fontSize: '0.875rem',
                                    marginBottom: '1.5rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setRejectModal(null); setRejectReason(''); }}
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
                                    onClick={handleReject}
                                    disabled={processing || !rejectReason.trim()}
                                    style={{
                                        padding: '0.6rem 1.5rem', borderRadius: '10px',
                                        border: 'none', background: 'var(--danger)', color: 'white',
                                        cursor: (processing || !rejectReason.trim()) ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        opacity: (processing || !rejectReason.trim()) ? 0.7 : 1
                                    }}
                                >
                                    {processing ? 'Processing...' : 'Reject'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
