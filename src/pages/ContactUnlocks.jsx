import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { unlockApi } from '../api/unlockApi';
import Pagination from '../components/Pagination';
import { FaUnlock, FaUser, FaArrowRight, FaMoneyBillWave, FaCalendarAlt, FaSearch, FaFilter, FaIdCard } from 'react-icons/fa';

export default function ContactUnlocks() {
    const [unlocks, setUnlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchUnlocks = async (page = 1) => {
        try {
            setLoading(true);
            const response = await unlockApi.getContactUnlocks({ page, search });
            setUnlocks(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setTotalPages(response.data.last_page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch contact unlocks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnlocks(1);
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserName = (user) => {
        if (!user) return 'Unknown User';
        if (user.user_profile) {
            return `${user.user_profile.first_name} ${user.user_profile.last_name}`;
        }
        return user.name || user.matrimony_id || 'Unknown';
    };

    return (
        <div style={{ padding: 'min(1.5rem, 5vw)' }}>
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2.5rem' }}
            >
                <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                    <FaUnlock /> Contact Unlocks
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Monitor profile interactions and revenue from contact details
                </p>
            </motion.div>

            {/* Stats Overview */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
            }}>
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    style={{ 
                        background: 'linear-gradient(135deg, var(--primary), #6366F1)', 
                        padding: '1.5rem', 
                        borderRadius: '20px', 
                        color: 'white',
                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem', fontWeight: 500 }}>Total Revenue</p>
                            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem' }}>
                                ₹{unlocks.reduce((sum, item) => sum + parseFloat(item.amount_paid || 0), 0).toFixed(2)}
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>From current view items</p>
                        </div>
                        <FaMoneyBillWave size={30} style={{ opacity: 0.5 }} />
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    style={{ 
                        background: 'var(--card-bg)', 
                        padding: '1.5rem', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 4px 15px var(--shadow-color)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Total Unlocks</p>
                            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: 'var(--text)' }}>{totalItems}</h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--success)' }}>+ Active interactions</p>
                        </div>
                        <FaUnlock size={30} color="var(--primary)" style={{ opacity: 0.2 }} />
                    </div>
                </motion.div>
            </div>

            {/* Search and Filters */}
            <div style={{ 
                background: 'var(--card-bg)', 
                padding: '1rem', 
                borderRadius: '16px', 
                marginBottom: '1.5rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, matrimony ID or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '40px', width: '100%', marginBottom: 0 }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <FaFilter size={14} />
                    <span style={{ fontSize: '0.9rem' }}>{totalItems} Results</span>
                </div>
            </div>

            {/* Main Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead style={{ background: 'var(--sidebar-bg)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Purchased By</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                                <th>Unlocked Profile</th>
                                <th style={{ textAlign: 'center' }}>Amount</th>
                                <th style={{ textAlign: 'center' }}>Method</th>
                                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '5rem' }}>
                                        <div className="loader" style={{ margin: '0 auto' }}></div>
                                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading transactions...</p>
                                    </td>
                                </tr>
                            ) : unlocks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
                                        No contact unlock records found.
                                    </td>
                                </tr>
                            ) : (
                                unlocks.map((item, index) => (
                                    <motion.tr 
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        style={{ borderBottom: '1px solid var(--border-color)' }}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                    <FaUser size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{getUserName(item.user)}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.user?.matrimony_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ color: 'var(--primary)', opacity: 0.5 }}>
                                                <FaArrowRight />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--success)15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                                                    <FaIdCard size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{getUserName(item.unlocked_user)}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.unlocked_user?.matrimony_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{parseFloat(item.amount_paid).toFixed(2)}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                padding: '0.4rem 0.75rem', 
                                                borderRadius: '20px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 600,
                                                background: 'var(--info)15',
                                                color: 'var(--info)',
                                                textTransform: 'uppercase'
                                            }}>
                                                {item.payment_method || 'Wallet'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <FaCalendarAlt size={12} />
                                                {formatDate(item.created_at)}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '1rem', background: 'var(--card-bg)' }}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => fetchUnlocks(page)}
                        totalItems={totalItems}
                        itemsPerPage={20}
                    />
                </div>
            </div>

            <style>{`
                .loader {
                    border: 3px solid var(--border-color);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                tr:hover { background: var(--sidebar-bg); transition: background 0.2s; }
            `}</style>
        </div>
    );
}
