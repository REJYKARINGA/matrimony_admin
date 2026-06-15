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
    FaClock
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

    const handlePageChange = (page) => {
        fetchAbandoned(page);
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

    if (!mounted) return null;

    return (
        <div style={{ padding: '2rem', position: 'relative' }}>
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
                        background: 'linear-gradient(135deg, var(--danger), var(--warning))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                    }}>
                        Abandoned Payments
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Follow up with users who initiated but didn&apos;t complete payment
                    </p>
                </div>
            </motion.div>

            {/* Stats Summary */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '16px', padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                        background: 'radial-gradient(circle, var(--warning)30 0%, transparent 70%)',
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaClock size={24} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Initiated (Pending)
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '16px', padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                        background: 'radial-gradient(circle, var(--danger)30 0%, transparent 70%)',
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaTimesCircle size={24} color="var(--danger)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Failed Payments
                        </div>
                    </div>
                </motion.div>
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

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search name, phone, ID..."
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
                        <option value="failed">Failed</option>
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
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>
                                            <FaUser style={{ marginRight: '0.5rem' }} />
                                            User
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>
                                            <FaPhone style={{ marginRight: '0.5rem' }} />
                                            Phone
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>
                                            <FaReceipt style={{ marginRight: '0.5rem' }} />
                                            Details
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>
                                            <FaMoneyBillWave style={{ marginRight: '0.5rem' }} />
                                            Amount
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>
                                            <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                                            Date
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {transactions.map((transaction, index) => {
                                            const phone = transaction.user_phone || transaction.user?.phone || '';
                                            return (
                                                <motion.tr
                                                    key={transaction.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -100 }}
                                                    whileHover="hover"
                                                    transition={{ delay: index * 0.05 }}
                                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                                >
                                                    <td style={{ padding: '1rem' }}>
                                                        <UserCell user={transaction.user} profile={transaction.user?.user_profile} />
                                                    </td>

                                                    <td style={{ padding: '1rem' }}>
                                                        {phone ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{phone}</span>
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                                                        )}
                                                    </td>

                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                                                {transaction.type === 'wallet_recharge' ? 'Wallet Recharge' : 'Contact Unlock'}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {transaction.description || 'No description'}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                            ₹{transaction.amount?.toLocaleString() || '0'}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontSize: '0.875rem' }}>
                                                            {formatDate(transaction.created_at)}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        <span className={`badge ${getStatusBadge(transaction.status)}`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>

                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        {phone && (
                                                            <motion.a
                                                                href={`tel:${phone}`}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                                    padding: '0.5rem 1rem', borderRadius: '8px',
                                                                    background: 'var(--success)', color: 'white',
                                                                    textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem'
                                                                }}
                                                            >
                                                                <FaPhone size={12} />
                                                                Call
                                                            </motion.a>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {transactions.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <FaExclamationTriangle size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>No abandoned payments found</p>
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
                    Showing {transactions.length} of {totalItems} records
                </motion.div>
            )}
        </div>
    );
}
