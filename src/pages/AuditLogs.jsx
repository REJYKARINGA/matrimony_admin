import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditApi } from '../api/auditApi';
import Pagination from '../components/Pagination';
import { FaHistory, FaFingerprint, FaDesktop, FaMapMarkerAlt, FaSearch, FaFilter, FaStream, FaCalendarAlt, FaTimes, FaChevronDown } from 'react-icons/fa';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';

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
    const [filtersOpen, setFiltersOpen] = useState(false);

    const { showToast, ToastComponent } = useToast();

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

    const activeFilterCount = 0;

    return (
        <div className="audit-logs-page">
            <style>{`
                .audit-logs-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .audit-logs-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .audit-logs-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .audit-logs-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .audit-logs-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .audit-logs-page .um-filter-toggle {
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
                .audit-logs-page .um-filter-badge {
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
                .audit-logs-page .um-cards { display: none; }
                .audit-logs-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .audit-logs-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .audit-logs-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .audit-logs-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .audit-logs-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .audit-logs-page .um-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .audit-logs-page .um-card-actions .btn {
                    flex: 1 1 auto;
                    justify-content: center;
                    padding: 0.55rem 0.75rem;
                }
                .audit-logs-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .audit-logs-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .audit-logs-page .um-skel-row {
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
                .audit-logs-page .um-filter-drawer {
                    display: none;
                }

                @media (max-width: 768px) {
                    .audit-logs-page .table-container { display: none; }
                    .audit-logs-page .um-cards { display: block; }
                    .audit-logs-page .um-filter-toggle { display: inline-flex; }
                    .audit-logs-page .filter-bar { display: none; }
                    .audit-logs-page .um-filter-drawer.open {
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--hover-bg);
                    }
                    .audit-logs-page .um-filter-drawer select {
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
                    .audit-logs-page .um-filter-drawer select:focus {
                        outline: none;
                        border-color: var(--primary);
                        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18);
                    }
                    .audit-logs-page .um-filter-drawer .span-full {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .audit-logs-page .um-filter-drawer .span-full input[type="number"] {
                        width: 100% !important;
                    }
                }

                @media (min-width: 769px) {
                    .audit-logs-page .um-filter-drawer { display: none !important; }
                }

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

                <div className="tabs-scroll" style={{ 
                    background: 'var(--card-bg)', 
                    padding: '0.4rem', 
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 10px var(--shadow-color)',
                    gap: 0, marginBottom: '1.5rem'
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
                <div className="um-search-row" style={{ marginBottom: 0, width: '100%' }}>
                    <div className="um-search-wrap" style={{ flex: 1 }}>
                        <FaSearch />
                        <input
                            type="text"
                            placeholder={activeTab === 'login_history' ? "Search by user, email, IP or location..." : "Search by user, action or details..."}
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
                        Sort
                        <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`} style={{ width: '100%' }}>
                        <select
                            value={`${sortBy}-${sortDir}`}
                            onChange={(e) => {
                                const [by, dir] = e.target.value.split('-');
                                setSortBy(by);
                                setSortDir(dir);
                            }}
                        >
                            <option value="created_at-desc">Sort: Newest</option>
                            <option value="created_at-asc">Sort: Oldest</option>
                            <option value="name-asc">Sort: Name (A-Z)</option>
                            <option value="name-desc">Sort: Name (Z-A)</option>
                        </select>
                    </div>
                    <div className="filter-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        <FaFilter size={14} />
                        <span style={{ fontSize: '0.9rem' }}>Showing {totalItems} entries</span>
                    </div>
                </div>
            </motion.div>

            {/* Main Table Content */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : data.length === 0 ? (
                    <div className="um-empty">
                        <FaHistory />
                        <p style={{ margin: 0, fontWeight: 600 }}>No audit entries found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="um-table-wrap">
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
                                        {data.map((item, index) => (
                                            <motion.tr 
                                                key={item.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <UserCell user={item.user} profile={item.user?.user_profile} />
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile cards */}
                        <div className="um-cards">
                            {data.map((item, index) => (
                                <div className="um-card" key={item.id}>
                                    <div className="um-card-top">
                                        <UserCell user={item.user} profile={item.user?.user_profile} />
                                        {activeTab === 'login_history' ? (
                                            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Login</span>
                                        ) : (
                                            <span style={{ 
                                                padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600,
                                                textTransform: 'uppercase',
                                                background: item.action?.includes('delete') ? '#FEE2E2' : 
                                                           item.action?.includes('update') ? '#FEF3C7' : 
                                                           item.action?.includes('create') ? '#ECFDF5' : '#E0F2FE',
                                                color: item.action?.includes('delete') ? '#B91C1C' : 
                                                       item.action?.includes('update') ? '#92400E' : 
                                                       item.action?.includes('create') ? '#065F46' : '#075985'
                                            }}>
                                                {item.action?.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    {activeTab === 'login_history' ? (
                                        <dl className="um-card-grid">
                                            <div>
                                                <dt>IP & Device</dt>
                                                <dd>
                                                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                                                        <FaDesktop size={10} color="var(--primary)" /> {item.ip_address}
                                                    </div>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt>Location</dt>
                                                <dd><FaMapMarkerAlt color="#EF4444" size={10} /> {item.location || 'Unknown'}</dd>
                                            </div>
                                            <div>
                                                <dt>Login Time</dt>
                                                <dd><FaCalendarAlt size={12} color="var(--primary)" /> {formatDate(item.login_at || item.created_at)}</dd>
                                            </div>
                                            <div>
                                                <dt>Device</dt>
                                                <dd style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.user_agent ? (item.user_agent.length > 60 ? item.user_agent.substring(0, 60) + '...' : item.user_agent) : '-'}</dd>
                                            </div>
                                        </dl>
                                    ) : (
                                        <dl className="um-card-grid">
                                            <div>
                                                <dt>Action</dt>
                                                <dd>{item.action?.replace('_', ' ')}</dd>
                                            </div>
                                            <div>
                                                <dt>IP Address</dt>
                                                <dd>{item.ip_address || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt>Details</dt>
                                                <dd style={{ fontSize: '0.75rem' }}>{typeof item.details === 'object' ? JSON.stringify(item.details) : item.details || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt>Activity Time</dt>
                                                <dd><FaCalendarAlt size={12} color="var(--primary)" /> {formatDate(item.created_at)}</dd>
                                            </div>
                                        </dl>
                                    )}
                                </div>
                            ))}
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
                    </>
                )}
            </div>

            {ToastComponent}
        </div>
    );
}
