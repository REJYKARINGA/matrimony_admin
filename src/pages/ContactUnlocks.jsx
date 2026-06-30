import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { unlockApi } from '../api/unlockApi';
import Pagination from '../components/Pagination';
import { FaUnlock, FaArrowRight, FaMoneyBillWave, FaCalendarAlt, FaSearch, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';
import UserCell from '../components/UserCell';
import { useToast } from '../components/Toast';

export default function ContactUnlocks() {
    const [unlocks, setUnlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { showToast, ToastComponent } = useToast();

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
    }, [search]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const totalRevenue = unlocks.reduce((sum, item) => sum + parseFloat(item.amount_paid || 0), 0);

    return (
        <div className="contact-unlocks-page">
            <style>{`
                .contact-unlocks-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .contact-unlocks-page .um-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .contact-unlocks-page .um-stat-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    border-radius: 14px;
                    border: 1px solid var(--border-color);
                    background: var(--hover-bg);
                }
                .contact-unlocks-page .um-stat-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                    color: white;
                }
                .contact-unlocks-page .um-stat-icon.revenue { background: linear-gradient(135deg, var(--primary), #6366F1); }
                .contact-unlocks-page .um-stat-icon.unlocks { background: var(--primary); }
                .contact-unlocks-page .um-stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    line-height: 1.1;
                }
                .contact-unlocks-page .um-stat-label {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .contact-unlocks-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .contact-unlocks-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .contact-unlocks-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .contact-unlocks-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .contact-unlocks-page .um-filter-toggle {
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
                .contact-unlocks-page .um-cards { display: none; }
                .contact-unlocks-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .contact-unlocks-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .contact-unlocks-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .contact-unlocks-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .contact-unlocks-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .contact-unlocks-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .contact-unlocks-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .contact-unlocks-page .um-skel-row {
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
                @media (max-width: 768px) {
                    .contact-unlocks-page .um-table-wrap { display: none; }
                    .contact-unlocks-page .um-cards { display: block; }
                    .contact-unlocks-page .um-filter-toggle { display: inline-flex; }
                    .contact-unlocks-page .filter-bar { display: none; }
                    .contact-unlocks-page .um-card-grid { grid-template-columns: 1fr; }
                    .contact-unlocks-page .um-stats { grid-template-columns: 1fr; }
                }
                @media (min-width: 769px) {
                    .contact-unlocks-page .um-filter-drawer { display: none !important; }
                }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}><FaUnlock /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>Contact Unlocks</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monitor profile interactions and revenue from contact details</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Stats Cards */}
                    <div className="um-stats">
                        <div className="um-stat-card">
                            <div className="um-stat-icon revenue"><FaMoneyBillWave /></div>
                            <div>
                                <div className="um-stat-value">₹{totalRevenue.toFixed(2)}</div>
                                <div className="um-stat-label">Total Revenue</div>
                            </div>
                        </div>
                        <div className="um-stat-card">
                            <div className="um-stat-icon unlocks"><FaUnlock /></div>
                            <div>
                                <div className="um-stat-value">{totalItems}</div>
                                <div className="um-stat-label">Total Unlocks</div>
                            </div>
                        </div>
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input type="text" placeholder="Search by name, matrimony ID or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            <FaFilter size={14} />
                            <span style={{ fontSize: '0.9rem' }}>{totalItems} Results</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '0 1.5rem 1.5rem' }}>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : unlocks.length === 0 ? (
                    <div className="um-empty">
                        <FaUnlock />
                        <p style={{ margin: 0, fontWeight: 600 }}>No contact unlocks found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search.</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                    <thead style={{ background: 'var(--sidebar-bg)' }}>
                                        <tr>
                                            <th style={{ padding: '1.25rem 1.5rem' }}>Purchased By</th>
                                            <th style={{ textAlign: 'center' }}></th>
                                            <th>Unlocked Profile</th>
                                            <th style={{ textAlign: 'center' }}>Amount</th>
                                            <th style={{ textAlign: 'center' }}>Method</th>
                                            <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unlocks.map((item, index) => (
                                            <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                                                style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <UserCell user={item.user} profile={item.user?.user_profile} avatarSize={40} />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ color: 'var(--primary)', opacity: 0.5 }}><FaArrowRight /></div>
                                                </td>
                                                <td>
                                                    <UserCell user={item.unlocked_user} profile={item.unlocked_user?.user_profile} avatarSize={40} />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{parseFloat(item.amount_paid).toFixed(2)}</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ padding: '0.4rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--info)15', color: 'var(--info)', textTransform: 'uppercase' }}>
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {unlocks.map((item, index) => (
                                <div className="um-card" key={item.id}>
                                    <div className="um-card-top">
                                        <UserCell user={item.user} profile={item.user?.user_profile} avatarSize={36} />
                                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>₹{parseFloat(item.amount_paid).toFixed(2)}</span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Unlocked Profile</dt>
                                            <dd><UserCell user={item.unlocked_user} profile={item.unlocked_user?.user_profile} avatarSize={32} /></dd>
                                        </div>
                                        <div>
                                            <dt>Method</dt>
                                            <dd><span style={{ padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--info)15', color: 'var(--info)', textTransform: 'uppercase' }}>{item.payment_method || 'Wallet'}</span></dd>
                                        </div>
                                        <div>
                                            <dt>Date</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{formatDate(item.created_at)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--card-bg)' }}>
                            <Pagination currentPage={currentPage} totalPages={totalPages}
                                onPageChange={(page) => fetchUnlocks(page)} totalItems={totalItems} itemsPerPage={20} />
                        </div>
                    </>
                )}
            </div>

            {ToastComponent}
        </div>
    );
}
