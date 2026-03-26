import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditApi } from '../api/auditApi';
import Pagination from '../components/Pagination';
import { FaHistory, FaFingerprint, FaDesktop, FaMapMarkerAlt, FaSearch, FaFilter, FaStream, FaCalendarAlt, FaUser } from 'react-icons/fa';

export default function AuditLogs() {
    const [activeTab, setActiveTab] = useState('login_history'); // 'login_history' or 'activity_logs'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const response = activeTab === 'login_history' 
                ? await auditApi.getLoginHistories({ page, search, sort_by: sortBy, sort_dir: sortDir })
                : await auditApi.getActivityLogs({ page, search, sort_by: sortBy, sort_dir: sortDir });
            
            setData(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setTotalPages(response.data.last_page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, [activeTab, search, sortBy, sortDir]);

    const handlePageChange = (page) => {
        fetchData(page);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div style={{ padding: 'min(1.5rem, 5vw)' }}>
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                        <FaHistory /> Audit & Security Logs
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Monitor system access and user activities
                    </p>
                </div>

                <div style={{ 
                    background: 'var(--card-bg)', 
                    padding: '0.4rem', 
                    borderRadius: '12px',
                    display: 'flex',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 10px var(--shadow-color)'
                }}>
                    <button 
                        onClick={() => setActiveTab('login_history')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'login_history' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'login_history' ? 'white' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaFingerprint /> Login History
                    </button>
                    <button 
                        onClick={() => setActiveTab('activity_logs')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'activity_logs' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'activity_logs' ? 'white' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FaStream /> Activity Logs
                    </button>
                </div>
            </motion.div>

            {/* Filter and Search Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    background: 'var(--card-bg)',
                    padding: '1rem 1.5rem',
                    borderRadius: '16px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 15px var(--shadow-color)'
                }}
            >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={`${sortBy}-${sortDir}`}
                        onChange={(e) => {
                            const [by, dir] = e.target.value.split('-');
                            setSortBy(by);
                            setSortDir(dir);
                        }}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        <option value="created_at-desc">Sort: Newest</option>
                        <option value="created_at-asc">Sort: Oldest</option>
                        <option value="name-asc">Sort: Name (A-Z)</option>
                        <option value="name-desc">Sort: Name (Z-A)</option>
                    </select>
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder={activeTab === 'login_history' ? "Search by user, email, IP or location..." : "Search by user, action or details..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '40px', width: '100%', marginBottom: 0 }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <FaFilter size={14} />
                    <span style={{ fontSize: '0.9rem' }}>Showing {totalItems} entries</span>
                </div>
            </motion.div>

            {/* Main Table Content */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead style={{ background: 'var(--sidebar-bg)' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem' }}>User</th>
                                {activeTab === 'login_history' ? (
                                    <>
                                        <th>IP & Device</th>
                                        <th>Location</th>
                                        <th>Login Time</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Action</th>
                                        <th>IP Address</th>
                                        <th>Details</th>
                                        <th>Activity Time</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'login_history' ? 4 : 5} style={{ textAlign: 'center', padding: '4rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div className="loader"></div>
                                            <span style={{ color: 'var(--text-secondary)' }}>Retrieving secure logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'login_history' ? 4 : 5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                                        No audit entries found for this period.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <motion.tr 
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{ 
                                                    width: '36px', height: '36px', borderRadius: '50%', 
                                                    background: 'var(--primary)15', display: 'flex', 
                                                    alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' 
                                                }}>
                                                    <FaUser size={16} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                                                        {item.user?.user_profile ? 
                                                            `${item.user.user_profile.first_name} ${item.user.user_profile.last_name}` : 
                                                            (item.user?.name || 'Unknown User')}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        {item.user?.matrimony_id || item.user?.email || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {activeTab === 'login_history' ? (
                                            <>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                            <FaDesktop size={12} color="var(--primary)" /> {item.ip_address}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.user_agent}>
                                                            {item.user_agent}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                        <FaMapMarkerAlt color="#EF4444" /> {item.location || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                                                        <FaCalendarAlt size={14} color="var(--primary)" /> {formatDate(item.login_at || item.created_at)}
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>
                                                    <span style={{ 
                                                        padding: '0.4rem 1rem', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        background: item.action?.includes('delete') ? '#FEE2E2' : 
                                                                   item.action?.includes('update') ? '#FEF3C7' : 
                                                                   item.action?.includes('create') ? '#ECFDF5' : '#E0F2FE',
                                                        color: item.action?.includes('delete') ? '#B91C1C' : 
                                                               item.action?.includes('update') ? '#92400E' : 
                                                               item.action?.includes('create') ? '#065F46' : '#075985'
                                                    }}>
                                                        {item.action?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                    {item.ip_address || '-'}
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                                        {typeof item.details === 'object' ? JSON.stringify(item.details) : item.details || '-'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                        <FaCalendarAlt size={14} color="var(--primary)" /> {formatDate(item.created_at)}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
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
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                tr:hover {
                    background: var(--sidebar-bg);
                }
            `}</style>
        </div>
    );
}
