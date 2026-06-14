import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaSpinner, FaCreditCard } from 'react-icons/fa';
import Pagination from '../components/Pagination';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchPayments(1);
    }, []);

    const fetchPayments = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/payments', { params: { page } });
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

    const loadingStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        color: 'var(--text-secondary)',
        gap: '1rem'
    };

    const emptyStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        color: 'var(--text-secondary)',
        gap: '0.75rem'
    };

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Transaction History</h2>
            {loading ? (
                <div style={loadingStyle}>
                    <FaSpinner size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Loading transactions...</span>
                </div>
            ) : payments.length === 0 ? (
                <div style={emptyStyle}>
                    <FaCreditCard size={32} />
                    <span>No transactions found.</span>
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
                                            <div style={{ fontWeight: '600' }}>{payment.user?.user_profile?.first_name}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{payment.user?.email}</div>
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
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalItems}
                        itemsPerPage={20}
                    />
                </>
            )}
        </div>
    );
}
