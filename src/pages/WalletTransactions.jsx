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
    FaReceipt,
    FaTimes,
    FaChevronDown
} from 'react-icons/fa';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';
import Pagination from '../components/Pagination';
import api from '../api/axios';

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
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { showToast, ToastComponent } = useToast();

    const activeFilterCount = filter !== 'all' ? 1 : 0;

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
                params: { search, filter, page }
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
        <div className="wallet-transactions-page">
            <style>{`
                .wallet-transactions-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .wallet-transactions-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .wallet-transactions-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .wallet-transactions-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .wallet-transactions-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .wallet-transactions-page .um-filter-toggle {
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
                .wallet-transactions-page .um-filter-badge {
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
                .wallet-transactions-page .um-cards { display: none; }
                .wallet-transactions-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .wallet-transactions-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .wallet-transactions-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .wallet-transactions-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .wallet-transactions-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .wallet-transactions-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .wallet-transactions-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .wallet-transactions-page .um-skel-row {
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
                .wallet-transactions-page .um-filter-drawer {
                    display: none;
                }
                @media (max-width: 768px) {
                    .wallet-transactions-page .um-table-wrap { display: none; }
                    .wallet-transactions-page .um-cards { display: block; }
                    .wallet-transactions-page .um-filter-toggle { display: inline-flex; }
                    .wallet-transactions-page .filter-bar { display: none; }
                    .wallet-transactions-page .um-card-grid { grid-template-columns: 1fr; }
                    .wallet-transactions-page .um-filter-drawer.open {
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--hover-bg);
                    }
                    .wallet-transactions-page .um-filter-drawer select {
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
                    .wallet-transactions-page .um-filter-drawer select:focus {
                        outline: none;
                        border-color: var(--primary);
                        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18);
                    }
                }
                @media (min-width: 769px) {
                    .wallet-transactions-page .um-filter-drawer { display: none !important; }
                }
            `}</style>

            <div className="card" style={{ padding: '1.5rem' }}>
                <div className="um-toolbar" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}><FaWallet /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>Wallet Transactions</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Track wallet activity, recharges, and spending across the platform</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Total Balance</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{walletStats.totalBalance.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Total Recharge</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981' }}>₹{walletStats.totalRecharge.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Total Spent</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#EF4444' }}>₹{walletStats.totalSpent.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Transactions</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{walletStats.totalTransactions.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <button type="button" className="um-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
                            {filtersOpen ? <FaTimes /> : <FaFilter />}
                            Filters
                            {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">Type: All</option>
                            <option value="wallet_recharge">Recharge</option>
                            <option value="contact_unlock">Contact Unlock</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setFilter('all')} style={{ justifyContent: 'center' }}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">Type: All</option>
                            <option value="wallet_recharge">Recharge</option>
                            <option value="contact_unlock">Contact Unlock</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setFilter('all')} style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                                <FaTimes /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="um-empty">
                        <FaWallet />
                        <p style={{ margin: 0, fontWeight: 600 }}>No transactions found</p>
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
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Amount</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr key={transaction.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <UserCell user={transaction.user} profile={transaction.user?.user_profile} />
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                        {transaction.type === 'wallet_recharge' ? <FaArrowDown color="#10B981" /> : <FaArrowUp color="#EF4444" />}
                                                        <span style={{ fontWeight: '600' }}>
                                                            {transaction.type === 'wallet_recharge' ? 'Wallet Recharge' : 'Contact Unlock'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {transaction.description || 'No description'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: transaction.type === 'wallet_recharge' ? '#10B981' : '#EF4444' }}>
                                                        {transaction.type === 'wallet_recharge' ? '+' : '-'}₹{transaction.amount?.toLocaleString() || '0'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                                    {formatDate(transaction.created_at)}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <span className={`badge ${getStatusBadge(transaction.status)}`}>{transaction.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {transactions.map((transaction) => (
                                <div className="um-card" key={transaction.id}>
                                    <div className="um-card-top">
                                        <UserCell user={transaction.user} profile={transaction.user?.user_profile} />
                                        <span className={`badge ${getStatusBadge(transaction.status)}`}>{transaction.status}</span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Type</dt>
                                            <dd>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    {transaction.type === 'wallet_recharge' ? <FaArrowDown color="#10B981" size={10} /> : <FaArrowUp color="#EF4444" size={10} />}
                                                    <span>{transaction.type === 'wallet_recharge' ? 'Wallet Recharge' : 'Contact Unlock'}</span>
                                                </div>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Amount</dt>
                                            <dd style={{ fontWeight: 700, color: transaction.type === 'wallet_recharge' ? '#10B981' : '#EF4444' }}>
                                                {transaction.type === 'wallet_recharge' ? '+' : '-'}₹{transaction.amount?.toLocaleString() || '0'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Date</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{formatDate(transaction.created_at)}</dd>
                                        </div>
                                        <div>
                                            <dt>Description</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{transaction.description || 'No description'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalItems} itemsPerPage={15} />
                        )}
                    </>
                )}
            </div>
            {ToastComponent}
        </div>
    );
}
