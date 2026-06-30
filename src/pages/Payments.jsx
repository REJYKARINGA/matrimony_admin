import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCreditCard, FaSearch } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        fetchPayments(1);
    }, [search]);

    const fetchPayments = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/payments', { params: { page, search: search || undefined } });
            setPayments(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch payments', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchPayments(page);
    };

    return (
        <div className="payments-page">
            <style>{`
                .payments-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .payments-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .payments-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .payments-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .payments-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .payments-page .um-cards { display: none; }
                .payments-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .payments-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .payments-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .payments-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .payments-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .payments-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .payments-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .payments-page .um-skel-row {
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
                    .payments-page .table-container { display: none; }
                    .payments-page .um-cards { display: block; }
                }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <h2 style={{ margin: '0 0 1.25rem' }}>Transaction History</h2>
                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search by user name, email, transaction ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="um-empty">
                        <FaCreditCard />
                        <p style={{ margin: 0, fontWeight: 600 }}>No transactions found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Plan / Type</th>
                                        <th>Status</th>
                                        <th>Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <UserCell user={payment.user} profile={payment.user?.user_profile} />
                                            </td>
                                            <td style={{ fontWeight: 'bold' }}>₹{payment.amount}</td>
                                            <td>{payment.subscription_id ? 'Subscription' : 'Wallet / Other'}</td>
                                            <td>
                                                <span className={`badge ${payment.status === 'completed' ? 'badge-verified' : 'badge-pending'}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{payment.transaction_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="um-cards">
                            {payments.map((payment) => (
                                <div className="um-card" key={payment.id}>
                                    <div className="um-card-top">
                                        <UserCell user={payment.user} profile={payment.user?.user_profile} />
                                        <span className={`badge ${payment.status === 'completed' ? 'badge-verified' : 'badge-pending'}`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Date</dt>
                                            <dd>{new Date(payment.created_at).toLocaleDateString()}</dd>
                                        </div>
                                        <div>
                                            <dt>Amount</dt>
                                            <dd style={{ fontWeight: 'bold' }}>₹{payment.amount}</dd>
                                        </div>
                                        <div>
                                            <dt>Plan / Type</dt>
                                            <dd>{payment.subscription_id ? 'Subscription' : 'Wallet / Other'}</dd>
                                        </div>
                                        <div>
                                            <dt>Transaction ID</dt>
                                            <dd style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{payment.transaction_id}</dd>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalItems}
                            itemsPerPage={20}
                        />
                    </>
                )}
                {ToastComponent}
            </div>
        </div>
    );
}
