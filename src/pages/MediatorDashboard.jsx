import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaPlus, FaExternalLinkAlt, FaSignOutAlt, FaBullhorn, FaMoon, FaSun, FaUniversity, FaSave, FaEye, FaThumbsUp, FaComment, FaTrash, FaCheckCircle, FaStar, FaWallet, FaShareAlt, FaCopy, FaUsers, FaRupeeSign } from 'react-icons/fa';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';
import './MediatorDashboard.css';


export default function MediatorDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('reference');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    // Reference card state
    const [referrals, setReferrals] = useState([]);
    const [referralStats, setReferralStats] = useState({ total_referrals: 0, total_purchases: 0 });
    const [referralLoading, setReferralLoading] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [newReferralIdentifier, setNewReferralIdentifier] = useState('');
    const [referralActionMessage, setReferralActionMessage] = useState({ type: '', text: '' });
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState(null);
    const REWARD_PER_PURCHASE = 20; // ₹20 per contact unlock
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
        fetchReferrals();
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

    const fetchReferrals = async () => {
        setReferralLoading(true);
        try {
            const response = await api.get('/references/my-referrals');
            setReferrals(response.data.referrals || []);
            setReferralStats({
                total_referrals: response.data.total_referrals || 0,
                total_purchases: response.data.total_purchases || 0,
                total_paid: response.data.total_paid || 0,
            });
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
        } finally {
            setReferralLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (!user?.reference_code) return;
        navigator.clipboard.writeText(user.reference_code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleAddReferral = async (e) => {
        e.preventDefault();
        if (!newReferralIdentifier.trim()) return;

        setReferralLoading(true);
        setReferralActionMessage({ type: '', text: '' });

        try {
            const response = await api.post('/references/add', {
                identifier: newReferralIdentifier
            });
            setReferralActionMessage({ type: 'success', text: response.data.message });
            setNewReferralIdentifier('');
            fetchReferrals(); // Refresh the list
            setTimeout(() => setIsClaimModalOpen(false), 2000); // Close modal on success after delay
        } catch (error) {
            setReferralActionMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to add referral.'
            });
        } finally {
            setReferralLoading(false);
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
        const totalPromoPayable = promotions.reduce((sum, p) => sum + calculatePayable(p), 0);
        const totalRefEarnings = referralStats.total_purchases * REWARD_PER_PURCHASE;
        const totalPayableCombined = totalPromoPayable + totalRefEarnings;

        if (totalPayableCombined <= 0) {
            alert('No pending payout balance.');
            return;
        }

        const primaryAcc = bankAccounts.find(a => a.is_primary);
        if (!primaryAcc) {
            alert('Please add and set a primary bank account first.');
            setActiveTab('bank-accounts');
            return;
        }

        if (!window.confirm(`Request payout of ₹${totalPayableCombined.toLocaleString()} to ${primaryAcc.account_name} (${primaryAcc.account_number})?`)) return;

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

    const handleViewUser = (referral) => {
        setSelectedReferral(referral);
        setIsUserDetailModalOpen(true);
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
            <div className="mediator-header">
                <div className="header-left">
                    <FaBullhorn size={24} color="var(--primary)" />
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text)' }}>Mediator Dashboard</h1>
                </div>
                <div className="header-right">
                    <span className="welcome-text">Welcome, {user?.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <div style={{ minWidth: 0 }}>
                    {/* Stats Summary Combined */}
                    {(() => {
                        const promoPayable = promotions.reduce((sum, p) => sum + calculatePayable(p), 0);
                        const refEarningsTotal = (referralStats.total_purchases || 0) * REWARD_PER_PURCHASE;
                        const refPaid = Number(referralStats.total_paid || 0);
                        const refPayable = Math.max(0, refEarningsTotal - refPaid);

                        const totalCombinedPayable = promoPayable + refPayable;

                        const promoPaid = promotions.reduce((sum, p) => sum + Number(p.total_paid_amount || 0), 0);
                        const totalCombinedPaid = promoPaid + refPaid;

                        return (
                            <div className="stats-grid">
                                <div className="stat-card" style={{
                                    background: 'var(--card-bg)',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Referrals</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {referralStats.total_referrals || 0}
                                    </div>
                                </div>
                                <div className="stat-card" style={{
                                    background: 'var(--card-bg)',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Promo Units</div>
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
                                            ₹{totalCombinedPayable.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            Incl. ₹{refPayable.toLocaleString()} Referral Earning
                                        </div>
                                    </div>
                                    {totalCombinedPayable > 0 && (
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
                                        ₹{totalCombinedPaid.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Tab Navigation */}
                    <div className="tab-nav">
                        <button
                            onClick={() => setActiveTab('promotions')}
                            className="tab-button"
                            style={{
                                borderBottom: activeTab === 'promotions' ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === 'promotions' ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                        >
                            <FaBullhorn /> My Promotions
                        </button>
                        <button
                            onClick={() => { setActiveTab('reference'); fetchReferrals(); }}
                            className="tab-button"
                            style={{
                                borderBottom: activeTab === 'reference' ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === 'reference' ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                        >
                            <FaShareAlt /> Reference Card
                        </button>
                        <button
                            onClick={() => setActiveTab('bank-accounts')}
                            className="tab-button"
                            style={{
                                borderBottom: activeTab === 'bank-accounts' ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === 'bank-accounts' ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                        >
                            <FaUniversity /> Bank Accounts
                        </button>
                    </div>

                    {activeTab === 'promotions' ? (
                        /* Promotions Section — unchanged */
                        <div style={{
                            background: 'var(--card-bg)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            padding: '1.5rem'
                        }}>
                            <div className="promotions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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
                    ) : activeTab === 'reference' ? (
                        /* ─── Reference Card Tab ─── */
                        <div style={{
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            padding: '2rem'
                        }}>
                            {/* Header */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ margin: '0 0 0.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaShareAlt color="var(--primary)" /> Reference Card
                                </h2>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Share your code with new users. Earn <strong style={{ color: 'var(--primary)' }}>₹{REWARD_PER_PURCHASE}</strong> for every contact unlock they make.
                                </p>
                            </div>

                            {/* Code + Summary row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

                                {/* Reference Code Card */}
                                <div style={{
                                    background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
                                    borderRadius: '14px',
                                    padding: '1.75rem',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ fontSize: '0.78rem', opacity: 0.85, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Reference Code</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '6px', marginBottom: '1rem', fontFamily: 'monospace' }}>
                                        {user?.reference_code || '------'}
                                    </div>
                                    <button
                                        onClick={handleCopyCode}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: '1px solid rgba(255,255,255,0.4)',
                                            color: 'white',
                                            padding: '0.4rem 1rem',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <FaCopy size={12} />
                                        {codeCopied ? '✓ Copied!' : 'Copy Code'}
                                    </button>
                                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                                </div>

                                {/* Total Referred */}
                                <div style={{ background: 'var(--bg)', borderRadius: '14px', padding: '1.75rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                        <FaUsers color="var(--primary)" /> Total Referred Users
                                    </div>
                                    <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                                        {referralStats.total_referrals}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>users joined with your code</div>
                                </div>

                                {/* Total Purchases */}
                                <div style={{ background: 'var(--bg)', borderRadius: '14px', padding: '1.75rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                        <FaRupeeSign color="#4CAF50" /> Total Purchases
                                    </div>
                                    <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#4CAF50' }}>
                                        {referralStats.total_purchases}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>contact unlocks by your referrals</div>
                                </div>

                                {/* Total Earnings */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                                    borderRadius: '14px',
                                    padding: '1.75rem',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ fontSize: '0.78rem', opacity: 0.85, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Earnings</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                        ₹{(referralStats.total_purchases * REWARD_PER_PURCHASE).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{referralStats.total_purchases} × ₹{REWARD_PER_PURCHASE} per unlock</div>
                                    <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                                </div>
                            </div>

                            {/* Claim New Referral Button */}
                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setNewReferralIdentifier('');
                                        setReferralActionMessage({ type: '', text: '' });
                                        setIsClaimModalOpen(true);
                                    }}
                                    className="btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.85rem 1.5rem', borderRadius: '12px' }}
                                >
                                    <FaPlus size={14} /> Claim New Referral
                                </button>
                            </div>

                            {/* Referral Table */}
                            <h3 style={{ margin: '0 0 1rem', color: 'var(--text)', fontSize: '1rem', fontWeight: '600' }}>Referred Users</h3>

                            {referralLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading referrals...</div>
                            ) : referrals.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(var(--primary-rgb), 0.02)', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
                                    <FaUsers size={42} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text)' }}>No Referrals Yet</h4>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Share your code <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', letterSpacing: '2px' }}>{user?.reference_code}</strong> with new users during registration.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', minWidth: '600px' }}>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Matrimony ID</th>
                                                <th>Ref Code</th>
                                                <th style={{ textAlign: 'center' }}>Purchases</th>
                                                <th style={{ textAlign: 'center' }}>Your Earning</th>
                                                <th>Joined</th>
                                                <th style={{ textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referrals.map((ref, index) => (
                                                <tr key={ref.id}>
                                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{index + 1}</td>
                                                    <td>
                                                        <span style={{
                                                            fontFamily: 'monospace',
                                                            fontWeight: '600',
                                                            color: 'var(--primary)',
                                                            background: 'rgba(var(--primary-rgb),0.08)',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {ref.referred_user?.matrimony_id || '—'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontFamily: 'monospace',
                                                            fontWeight: '600',
                                                            color: 'var(--text)',
                                                            background: 'var(--bg)',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            border: '1px solid var(--border-color)',
                                                            letterSpacing: '1px'
                                                        }}>
                                                            {ref.referred_user?.reference_code || '—'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            background: ref.purchased_count > 0 ? 'rgba(76,175,80,0.12)' : 'var(--bg)',
                                                            color: ref.purchased_count > 0 ? '#4CAF50' : 'var(--text-secondary)',
                                                            fontWeight: '700',
                                                            padding: '4px 14px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.9rem',
                                                            border: ref.purchased_count > 0 ? '1px solid rgba(76,175,80,0.3)' : '1px solid var(--border-color)',
                                                            display: 'inline-block'
                                                        }}>
                                                            {ref.purchased_count}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: '700', color: ref.purchased_count > 0 ? '#4CAF50' : 'var(--text-secondary)' }}>
                                                        ₹{(ref.purchased_count * REWARD_PER_PURCHASE).toLocaleString()}
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {ref.joined_at ? new Date(ref.joined_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleViewUser(ref)}
                                                            className="btn-icon"
                                                            title="View User Details"
                                                            style={{
                                                                background: 'rgba(var(--primary-rgb), 0.1)',
                                                                color: 'var(--primary)',
                                                                padding: '6px 12px',
                                                                borderRadius: '8px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            <FaEye size={12} /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: 'rgba(var(--primary-rgb),0.04)', fontWeight: '700' }}>
                                                <td colSpan={3} style={{ padding: '0.75rem 1rem', color: 'var(--text)' }}>Total</td>
                                                <td style={{ textAlign: 'center', color: '#4CAF50', padding: '0.75rem 1rem' }}>{referralStats.total_purchases}</td>
                                                <td style={{ textAlign: 'center', color: '#4CAF50', padding: '0.75rem 1rem' }}>₹{(referralStats.total_purchases * REWARD_PER_PURCHASE).toLocaleString()}</td>
                                                <td colSpan={2} />
                                            </tr>
                                        </tfoot>
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
                            <div className="bank-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
                                <div className="bank-grid">
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

            {/* Claim Referral Modal */}
            <FormModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                title="Claim Referral Code"
                onSubmit={handleAddReferral}
                isLoading={referralLoading}
                submitText="Claim User"
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        If a user registered but forgot to use your code, enter <strong>their unique 6-letter reference code</strong> below to link them to your account.
                    </p>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>User's Reference Code</label>
                    <input
                        type="text"
                        placeholder="Enter 6-letter Code"
                        maxLength={6}
                        value={newReferralIdentifier}
                        onChange={(e) => setNewReferralIdentifier(e.target.value.toUpperCase())}
                        required
                        style={{
                            textAlign: 'center',
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            border: '1px solid var(--border-color)',
                            padding: '12px'
                        }}
                    />
                </div>

                {referralActionMessage.text && (
                    <div style={{
                        marginBottom: '0.5rem',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        background: referralActionMessage.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                        color: referralActionMessage.type === 'success' ? '#4CAF50' : '#F44336',
                        border: `1px solid ${referralActionMessage.type === 'success' ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}`
                    }}>
                        {referralActionMessage.text}
                    </div>
                )}
            </FormModal>

            {/* User Details Modal */}
            <FormModal
                isOpen={isUserDetailModalOpen}
                onClose={() => setIsUserDetailModalOpen(false)}
                title="User Details"
                submitText="Close"
                onSubmit={(e) => { e.preventDefault(); setIsUserDetailModalOpen(false); }}
            >
                {selectedReferral && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            {selectedReferral.referred_user?.user_profile?.profile_picture ? (
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${selectedReferral.referred_user.user_profile.profile_picture}`}
                                    alt="Profile"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '4px solid var(--primary)',
                                        padding: '4px'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'rgba(var(--primary-rgb), 0.1)',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    fontSize: '2rem',
                                    border: '4px solid var(--primary)',
                                    padding: '4px'
                                }}>
                                    <FaUsers />
                                </div>
                            )}
                        </div>

                        <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text)' }}>
                            {selectedReferral.referred_user?.user_profile?.first_name || 'Anonymous User'} {selectedReferral.referred_user?.user_profile?.last_name || ''}
                        </h3>
                        <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {selectedReferral.referred_user?.role?.toUpperCase() || 'USER'}
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            textAlign: 'left',
                            background: 'rgba(var(--primary-rgb), 0.02)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Matrimony ID</label>
                                <span style={{ fontWeight: '600', color: 'var(--text)' }}>{selectedReferral.referred_user?.matrimony_id || '—'}</span>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Joined Date</label>
                                <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                                    {selectedReferral.joined_at ? new Date(selectedReferral.joined_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Purchases</label>
                                <span style={{ fontWeight: '600', color: '#4CAF50' }}>{selectedReferral.purchased_count} Contact Unlocks</span>
                            </div>
                        </div>
                    </div>
                )}
            </FormModal>
        </div>
    );
}
