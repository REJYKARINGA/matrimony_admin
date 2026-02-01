import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaPlus, FaExternalLinkAlt, FaSignOutAlt, FaBullhorn, FaMoon, FaSun, FaUniversity, FaSave, FaEye, FaThumbsUp, FaComment, FaTrash, FaCheckCircle, FaStar, FaWallet } from 'react-icons/fa';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';


export default function MediatorDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('promotions');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [formData, setFormData] = useState({
        platform: '',
        link: ''
    });

    // Bank Details State
    const [bankDetails, setBankDetails] = useState({
        account_name: '',
        account_number: '',
        ifsc_code: ''
    });
    const [isBankEditing, setIsBankEditing] = useState(false);
    const [bankSubmitting, setBankSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('admin_user') || '{}');

        if (!token || userData.role !== 'mediator') {
            navigate('/');
            return;
        }

        // Fetch initial data
        fetchUser();
        fetchPromotions();
        fetchBankAccounts();
    }, [navigate]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/user');
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchBankAccounts = async () => {
        try {
            const response = await api.get('/mediator/bank-accounts');
            setBankAccounts(response.data.bank_accounts);
        } catch (error) {
            console.error('Failed to fetch bank accounts:', error);
        }
    };




    const fetchPromotions = async () => {
        try {
            const response = await api.get('/mediator/promotions');
            setPromotions(response.data.promotions);
        } catch (error) {
            console.error('Failed to fetch promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePayable = (promo) => {
        if (!promo || !promo.setting) return 0;

        const viewsCount = Number(promo.views_count) || 0;
        const likesCount = Number(promo.likes_count) || 0;
        const commentsCount = Number(promo.comments_count) || 0;

        const viewsReq = Number(promo.setting.views_required) || 1;
        const likesReq = Number(promo.setting.likes_required) || 1;
        const commentsReq = Number(promo.setting.comments_required) || 1;
        const payoutPerUnit = Number(promo.setting.payout_amount) || 0;

        const viewsUnits = Math.floor(viewsCount / viewsReq);
        let finalUnits = viewsUnits;

        if (promo.setting.is_likes_enabled) {
            const likesUnits = Math.floor(likesCount / likesReq);
            finalUnits = Math.min(finalUnits, likesUnits);
        }

        if (promo.setting.is_comments_enabled) {
            const commentsUnits = Math.floor(commentsCount / commentsReq);
            finalUnits = Math.min(finalUnits, commentsUnits);
        }

        const totalEarned = finalUnits * payoutPerUnit;
        const totalPaid = Number(promo.total_paid_amount) || 0;

        return Math.max(0, totalEarned - totalPaid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/mediator/promotions', formData);
            fetchPromotions();
            setIsModalOpen(false);
            setFormData({ platform: '', link: '' });
        } catch (error) {
            console.error('Failed to submit promotion:', error);
            alert('Failed to submit promotion');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestPayout = async () => {
        const totalPayable = promotions.reduce((sum, p) => sum + calculatePayable(p), 0);
        if (totalPayable <= 0) {
            alert('No pending payout balance.');
            return;
        }

        const primaryAcc = bankAccounts.find(a => a.is_primary);
        if (!primaryAcc) {
            alert('Please add and set a primary bank account first.');
            setActiveTab('bank-accounts');
            return;
        }

        if (!window.confirm(`Request payout of ₹${totalPayable.toLocaleString()} to ${primaryAcc.account_name} (${primaryAcc.account_number})?`)) return;

        try {
            const response = await api.post('/mediator/request-payout');
            alert(response.data.message);
            fetchPromotions();
            fetchBankAccounts();
        } catch (error) {
            console.error('Payout failed:', error);
            alert(error.response?.data?.error || 'Payout request failed');
        }
    };

    const handleBankDetailsSubmit = async (e) => {
        e.preventDefault();
        setBankSubmitting(true);
        try {
            await api.post('/mediator/bank-accounts', { ...bankDetails, is_primary: bankAccounts.length === 0 });
            setIsBankModalOpen(false);
            setBankDetails({ account_name: '', account_number: '', ifsc_code: '' });
            fetchBankAccounts();
            alert('Bank account added successfully');
        } catch (error) {
            console.error('Failed to add bank account:', error);
            alert(error.response?.data?.error || 'Failed to add bank account');
        } finally {
            setBankSubmitting(false);
        }
    };

    const handleSetPrimary = async (id) => {
        try {
            await api.put(`/mediator/bank-accounts/${id}/primary`);
            fetchBankAccounts();
            fetchUser(); // Update primary account info in user object if needed
        } catch (error) {
            console.error('Failed to set primary account:', error);
            alert('Failed to set primary account');
        }
    };

    const handleDeleteAccount = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bank account?')) return;
        try {
            await api.delete(`/mediator/bank-accounts/${id}`);
            fetchBankAccounts();
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert(error.response?.data?.error || 'Failed to delete account');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        navigate('/');
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#FFA500',
            verified: '#4CAF50',
            paid: '#2196F3',
            rejected: '#F44336'
        };
        return colors[status] || '#999';
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--card-bg)',
                borderBottom: '1px solid var(--border-color)',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaBullhorn size={24} color="var(--primary)" />
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text)' }}>Mediator Dashboard</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.name}</span>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            color: 'var(--text)',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ minWidth: 0 }}>
                    {/* Stats Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div className="stat-card" style={{
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Submissions</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {promotions.length}
                            </div>
                        </div>
                        <div className="stat-card" style={{
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Verified</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
                                {promotions.filter(p => p.status === 'verified').length}
                            </div>
                        </div>
                        <div className="stat-card" style={{
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Payable</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    ₹{promotions.reduce((sum, p) => sum + calculatePayable(p), 0).toLocaleString()}
                                </div>
                            </div>
                            {promotions.reduce((sum, p) => sum + calculatePayable(p), 0) > 0 && (
                                <button
                                    onClick={handleRequestPayout}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.5rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FaWallet /> Withdraw Funds
                                </button>
                            )}
                        </div>
                        <div className="stat-card" style={{
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Paid</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
                                ₹{promotions.reduce((sum, p) => sum + Number(p.total_paid_amount || 0), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '2rem',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '2px'
                    }}>
                        <button
                            onClick={() => setActiveTab('promotions')}
                            style={{
                                padding: '1rem 2rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'promotions' ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === 'promotions' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaBullhorn /> My Promotions
                        </button>
                        <button
                            onClick={() => setActiveTab('bank-accounts')}
                            style={{
                                padding: '1rem 2rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'bank-accounts' ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === 'bank-accounts' ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaUniversity /> Bank Accounts
                        </button>
                    </div>

                    {activeTab === 'promotions' ? (
                        /* Promotions Section */
                        <div style={{
                            background: 'var(--card-bg)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, color: 'var(--text)' }}>My Promotions</h2>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsModalOpen(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <FaPlus /> Submit New Promotion
                                </button>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
                            ) : promotions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <FaBullhorn size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p>No promotions submitted yet. Click "Submit New Promotion" to get started!</p>
                                </div>
                            ) : (
                                <div className="table-container" style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ minWidth: '1000px', width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>Platform</th>
                                                <th>Link</th>
                                                <th>Stats (V/L/C)</th>
                                                <th style={{ textAlign: 'center' }}>Payable Amount</th>
                                                <th style={{ textAlign: 'center' }}>Pending Payout</th>
                                                <th>Remarks</th>
                                                <th>Total Paid</th>
                                                <th style={{ textAlign: 'center' }}>Status</th>
                                                <th>Submitted</th>
                                                <th>Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {promotions.map((promo) => (
                                                <tr key={promo.id}>
                                                    <td style={{ textTransform: 'capitalize' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            background: 'rgba(var(--primary-rgb), 0.1)',
                                                            color: 'var(--primary)',
                                                            fontWeight: '600'
                                                        }}>
                                                            {promo.platform}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <a
                                                            href={promo.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem' }}
                                                        >
                                                            View <FaExternalLinkAlt size={10} />
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                                            <span title="Views" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaEye size={12} color="#2196F3" /> {Number(promo.views_count).toLocaleString()}</span>
                                                            <span title="Likes" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaThumbsUp size={12} color="#E91E63" /> {Number(promo.likes_count).toLocaleString()}</span>
                                                            <span title="Comments" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaComment size={12} color="var(--primary)" /> {Number(promo.comments_count).toLocaleString()}</span>
                                                        </div>
                                                        {promo.setting && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                                                                Target: {promo.setting.views_required.toLocaleString()}V
                                                                {promo.setting.is_likes_enabled && ` / ${promo.setting.likes_required.toLocaleString()}L`}
                                                                {promo.setting.is_comments_enabled && ` / ${promo.setting.comments_required.toLocaleString()}C`}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div style={{
                                                            fontWeight: 'bold',
                                                            fontSize: '1rem',
                                                            color: calculatePayable(promo) > 0 ? '#4CAF50' : 'var(--text-secondary)',
                                                            background: calculatePayable(promo) > 0 ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            display: 'inline-block',
                                                            minWidth: '80px',
                                                            border: calculatePayable(promo) > 0 ? '1px solid rgba(76, 175, 80, 0.2)' : 'none'
                                                        }}>
                                                            ₹{calculatePayable(promo).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div style={{
                                                            fontWeight: 'bold',
                                                            fontSize: '0.9rem',
                                                            color: Number(promo.calculated_payout) > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                                                            opacity: 0.8
                                                        }}>
                                                            ₹{Number(promo.calculated_payout).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {promo.setting ? (() => {
                                                            const payable = calculatePayable(promo);
                                                            const payout_rate = Number(promo.setting.payout_amount);
                                                            const pendingUnits = Math.round(payable / payout_rate);
                                                            const paidUnits = Math.round(Number(promo.total_paid_amount) / payout_rate);

                                                            if (payable > 0) {
                                                                return (
                                                                    <div style={{ color: '#4CAF50' }}>
                                                                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Eligible: {pendingUnits} more unit(s)</div>
                                                                        <div style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.8 }}>
                                                                            {pendingUnits} × ₹{payout_rate}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            const viewsPerUnit = Number(promo.setting.views_required) || 1;
                                                            const totalViewUnits = Math.floor(Number(promo.views_count) / viewsPerUnit);
                                                            const vReq = Number(promo.setting.views_required);

                                                            if (totalViewUnits === 0) {
                                                                return <span style={{ color: '#F44336', fontSize: '0.8rem' }}>Need {vReq - promo.views_count} more Views</span>;
                                                            }

                                                            if (Number(promo.total_paid_amount) > 0) {
                                                                return <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Full paid for {totalViewUnits} unit(s)</span>;
                                                            }

                                                            return <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No pending payout</span>;
                                                        })() : '-'}
                                                    </td>
                                                    <td style={{ fontWeight: '600' }}>₹{Number(promo.total_paid_amount || 0).toLocaleString()}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold',
                                                            background: `${getStatusColor(promo.status)}20`,
                                                            color: getStatusColor(promo.status),
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {promo.status}
                                                        </span>
                                                    </td>
                                                    <td><TimeFormatCell date={promo.created_at} /></td>
                                                    <td><TimeFormatCell date={promo.updated_at} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Bank Accounts Section */
                        <div style={{
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            padding: '2rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '1.5rem' }}>Bank Accounts</h2>
                                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Manage your bank details for receiving payouts.
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsBankModalOpen(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <FaPlus /> Add New Account
                                </button>
                            </div>

                            {bankAccounts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(var(--primary-rgb), 0.02)', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
                                    <FaUniversity size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>No Bank Accounts Found</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Submit your bank details to enable payouts for your promotions.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                    {bankAccounts.map((account) => (
                                        <div key={account.id} style={{
                                            background: account.is_primary ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg)',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            border: account.is_primary ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                            position: 'relative',
                                            transition: 'transform 0.2s ease',
                                            ':hover': { transform: 'translateY(-5px)' }
                                        }}>
                                            {account.is_primary && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '1rem',
                                                    right: '1rem',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <FaStar size={10} /> PRIMARY
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '12px',
                                                    background: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white'
                                                }}>
                                                    <FaUniversity size={24} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text)' }}>{account.account_name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{account.ifsc_code}</div>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Account Number</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '600', letterSpacing: '2px', color: 'var(--text)' }}>
                                                    {account.is_primary ? account.account_number : `XXXXXX${account.account_number.slice(-4)}`}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {!account.is_primary && (
                                                    <button
                                                        onClick={() => handleSetPrimary(account.id)}
                                                        className="btn btn-outline"
                                                        style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}
                                                    >
                                                        Make Primary
                                                    </button>
                                                )}
                                                {!account.is_primary && (
                                                    <button
                                                        onClick={() => handleDeleteAccount(account.id)}
                                                        className="btn btn-secondary"
                                                        style={{ color: '#F44336', borderColor: '#F44336', padding: '0.5rem' }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                                {account.razorpay_fund_account_id && (
                                                    <div style={{
                                                        marginLeft: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        color: '#4CAF50',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        <FaCheckCircle /> Verified
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{
                                marginTop: '3rem',
                                padding: '1.5rem',
                                background: 'rgba(var(--primary-rgb), 0.02)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{ color: 'var(--primary)', marginTop: '2px' }}><FaBullhorn /></div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    <strong style={{ color: 'var(--text)' }}>Payout Policy:</strong> All earnings will be transferred to your <strong style={{ color: 'var(--primary)' }}>Primary Account</strong>. Please ensure the details are accurate. We support instant transfers to verified Razorpay fund accounts.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Promotion Modal */}
            {isModalOpen && (
                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Submit New Promotion"
                    onSubmit={handleSubmit}
                    isLoading={submitting}
                    submitText="Submit"
                >
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Platform</label>
                        <select
                            className="form-control"
                            value={formData.platform}
                            onChange={e => setFormData({ ...formData, platform: e.target.value })}
                            required
                        >
                            <option value="">Select Platform</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>

                        </select>
                    </div>

                    <div className="form-group">
                        <label>Video/Post Link</label>
                        <input
                            type="url"
                            className="form-control"
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            placeholder="https://..."
                            required
                        />
                        <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                            {formData.platform === 'youtube'
                                ? 'Example: https://www.youtube.com/watch?v=VIDEO_ID'
                                : formData.platform === 'instagram'
                                    ? 'Example: https://www.instagram.com/reel/C8X_qP_.../'
                                    : 'Paste the direct link to your promotional video or post'
                            }
                        </small>
                    </div>

                    {formData.platform === 'instagram' && (
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>Instagram Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.username || ''}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="e.g. your_instagram_handle"
                                required
                            />
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                                Required for automatic stats fetching.
                            </small>
                        </div>
                    )}

                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        marginTop: '1rem'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <strong>Note:</strong> Stats will be verified by admin after submission.
                        </p>
                    </div>
                </FormModal>
            )}

            {/* Add Bank Account Modal */}
            {isBankModalOpen && (
                <FormModal
                    isOpen={isBankModalOpen}
                    onClose={() => setIsBankModalOpen(false)}
                    title="Add Bank Account"
                    onSubmit={handleBankDetailsSubmit}
                    isLoading={bankSubmitting}
                    submitText="Add Account"
                >
                    <div className="form-group">
                        <label>Account Holder Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={bankDetails.account_name}
                            onChange={e => setBankDetails({ ...bankDetails, account_name: e.target.value })}
                            required
                            placeholder="As per bank passbook"
                        />
                    </div>
                    <div className="form-group">
                        <label>Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            value={bankDetails.account_number}
                            onChange={e => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                            required
                            pattern="\d{9,18}"
                            title="Enter a valid account number"
                        />
                    </div>
                    <div className="form-group">
                        <label>IFSC Code</label>
                        <input
                            type="text"
                            className="form-control"
                            value={bankDetails.ifsc_code}
                            onChange={e => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
                            required
                            pattern="[A-Z]{4}0[A-Z0-9]{6}"
                            placeholder="ABCD0123456"
                            title="Enter a valid IFSC code"
                        />
                    </div>
                </FormModal>
            )}
        </div>
    );
}
