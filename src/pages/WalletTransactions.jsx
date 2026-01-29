import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaWallet, 
    FaArrowDown, 
    FaArrowUp, 
    FaSearch, 
    FaFilter,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaUser,
    FaReceipt
} from 'react-icons/fa';
import api from '../api/axios';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

const rowHoverVariants = {
    hover: {
        y: -2,
        backgroundColor: 'var(--hover-bg)',
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    }
};

export default function WalletTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [walletStats, setWalletStats] = useState({
        totalBalance: 0,
        totalRecharge: 0,
        totalSpent: 0,
        totalTransactions: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchWalletStats();
        fetchTransactions(1);
    }, [search, filter]);

    const fetchWalletStats = async () => {
        try {
            const response = await api.get('/admin/wallet/stats');
            setWalletStats(response.data);
        } catch (error) {
            console.error('Failed to fetch wallet stats', error);
        }
    };

    const fetchTransactions = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/wallet/transactions', {
                params: {
                    search,
                    filter,
                    page
                }
            });
            setTransactions(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchTransactions(page);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadge = (status) => {
        const badges = {
            success: 'badge-success',
            pending: 'badge-warning',
            failed: 'badge-danger'
        };
        return badges[status] || 'badge-secondary';
    };

    if (!mounted) return null;

    return (
        <div style={{ padding: '2rem', position: 'relative' }}>
            {/* Animated Background */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                    zIndex: -1
                }}
                animate={{
                    background: [
                        `radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%)`,
                        `radial-gradient(circle at 30% 70%, var(--primary)30 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, var(--secondary)30 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%)`
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    marginBottom: '2rem' 
                }}
            >
                <motion.div
                    animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        repeatDelay: 3 
                    }}
                >
                    <FaWallet size={32} color="var(--primary)" />
                </motion.div>
                <h1 style={{ 
                    margin: 0, 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Wallet Transactions
                </h1>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--primary)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaMoneyBillWave size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Balance
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            ₹{walletStats.totalBalance.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--success)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaArrowDown size={24} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Recharge
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            ₹{walletStats.totalRecharge.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--danger)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaArrowUp size={24} color="var(--danger)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Spent
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            ₹{walletStats.totalSpent.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--info)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaReceipt size={24} color="var(--info)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Transactions
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {walletStats.totalTransactions.toLocaleString()}
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
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Transaction History</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ 
                                paddingLeft: '40px',
                                width: '250px',
                                marginBottom: 0,
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                    </div>
                    
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ 
                            padding: '0.75rem 1rem',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text)',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Transactions</option>
                        <option value="wallet_recharge">Recharge</option>
                        <option value="contact_unlock">Contact Unlock</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </motion.div>

            {/* Transactions Table */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    overflow: 'hidden'
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'inline-block' }}
                        >
                            <FaWallet size={32} color="var(--primary)" />
                        </motion.div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading transactions...</p>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {transactions.map((transaction, index) => (
                                            <motion.tr
                                                key={transaction.id}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: -100 }}
                                                whileHover="hover"
                                                transition={{ delay: index * 0.05 }}
                                                style={{
                                                    borderBottom: '1px solid var(--border-color)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                        {transaction.user?.user_profile?.first_name || 'N/A'} 
                                                        {transaction.user?.user_profile?.last_name || ''}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                        {transaction.user?.email || 'N/A'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        ID: {transaction.user?.matrimony_id || 'N/A'}
                                                    </div>
                                                </td>
                                                
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.5rem',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {transaction.type === 'wallet_recharge' ? (
                                                            <FaArrowDown color="var(--success)" />
                                                        ) : (
                                                            <FaArrowUp color="var(--danger)" />
                                                        )}
                                                        <span style={{ fontWeight: '600' }}>
                                                            {transaction.type === 'wallet_recharge' ? 'Wallet Recharge' : 'Contact Unlock'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {transaction.description || 'No description'}
                                                    </div>
                                                </td>
                                                
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ 
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1rem',
                                                        color: transaction.type === 'wallet_recharge' ? 'var(--success)' : 'var(--danger)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        {transaction.type === 'wallet_recharge' ? '+' : '-'}
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
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {transactions.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <FaWallet size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>No transactions found</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                marginTop: '1.5rem',
                                padding: '1rem',
                                borderTop: '1px solid var(--border-color)'
                            }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text)',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        opacity: currentPage === 1 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </motion.button>

                                <span style={{ 
                                    padding: '0.5rem 1rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontWeight: '600'
                                }}>
                                    {currentPage} / {totalPages}
                                </span>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
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

            {/* Summary */}
            {totalItems > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        textAlign: 'center',
                        marginTop: '1rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                    }}
                >
                    Showing {transactions.length} of {totalItems} transactions
                </motion.div>
            )}
        </div>
    );
}