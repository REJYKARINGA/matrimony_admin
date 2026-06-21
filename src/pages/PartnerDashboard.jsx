import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
    FaPlus, FaSignOutAlt, FaMoon, FaSun, FaUniversity,
    FaEye, FaUsers, FaShareAlt, FaCopy, FaBuilding,
    FaUserTie, FaMoneyCheck, FaRupeeSign, FaHandshake,
    FaTrash, FaStar, FaWallet, FaBullhorn
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import UserCell from '../components/UserCell';
import './MediatorDashboard.css';

export default function PartnerDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const officeId = queryParams.get('office_id');

    const [user, setUser] = useState(null);
    const [office, setOffice] = useState(null);
    const [stats, setStats] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [agentSubmitting, setAgentSubmitting] = useState(false);
    const [confirmPayoutOpen, setConfirmPayoutOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const { showToast, ToastComponent } = useToast();

    const [agentForm, setAgentForm] = useState({
        name: '', phone: '', email: '', create_login: false, password: '', status: 'active'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('admin_user') || '{}');
        const isPartner = userData.role === 'partner_office';
        const isAdmin = userData.role === 'super_admin' || userData.role === 'admin';

        if (!token || (!isPartner && !isAdmin)) {
            navigate('/');
            return;
        }

        if (isAdmin && !officeId) {
            showToast('Please select a partner office to view its dashboard', 'info');
            navigate('/partner-offices');
            return;
        }

        fetchData();
    }, [officeId]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = officeId ? { office_id: officeId } : {};
            const userResp = await api.get('/auth/user');
            setUser(userResp.data.user);

            const statsResp = await api.get('/partner/stats', { params });
            setStats(statsResp.data.stats);
            setOffice(statsResp.data.office);

            const regResp = await api.get('/partner/registrations', { params: { ...params, per_page: 20 } });
            setRegistrations(regResp.data.registrations.data || regResp.data.registrations);

            const agentResp = await api.get('/partner/agents', { params });
            setAgents(agentResp.data.agents || []);

            const bankResp = await api.get('/partner/bank-accounts', { params });
            setBankAccounts(bankResp.data.bank_accounts || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            if (error.response?.status === 403 || error.response?.status === 400) {
                 showToast(error.response?.data?.message || 'Access Denied', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        setAgentSubmitting(true);
        try {
            const data = officeId ? { ...agentForm, office_id: officeId } : agentForm;
            await api.post('/partner/agents', data);
            showToast('Agent added successfully');
            setIsAgentModalOpen(false);
            setAgentForm({ name: '', phone: '', email: '', create_login: false, password: '', status: 'active' });
            
            const params = officeId ? { office_id: officeId } : {};
            const agentResp = await api.get('/partner/agents', { params });
            setAgents(agentResp.data.agents || []);
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to add agent', 'error');
        } finally {
            setAgentSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        navigate('/');
    };

    const handleRequestPayout = async () => {
        if (!stats?.pending_payout || stats.pending_payout <= 0) {
            showToast('No pending payout balance.', 'error');
            return;
        }
        const primaryAcc = bankAccounts.find(a => a.is_primary);
        if (!primaryAcc) {
            showToast('Please add and set a primary bank account first.', 'error');
            return;
        }
        setConfirmPayoutOpen(true);
    };

    const confirmPayout = async () => {
        try {
            const resp = await api.post('/partner/request-payout');
            showToast(resp.data.message);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.error || 'Payout request failed', 'error');
        } finally {
            setConfirmPayoutOpen(false);
        }
    };

    const handleAddBankAccount = async (e) => {
        e.preventDefault();
        try {
            await api.post('/partner/bank-accounts', bankForm);
            setIsBankModalOpen(false);
            setBankForm({ account_name: '', account_number: '', ifsc_code: '' });
            const bankResp = await api.get('/partner/bank-accounts');
            setBankAccounts(bankResp.data.bank_accounts || []);
            showToast('Bank account added');
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed', 'error');
        }
    };

    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [bankForm, setBankForm] = useState({ account_name: '', account_number: '', ifsc_code: '' });

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        </div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <div className="mediator-header">
                <div className="header-left">
                    <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text)' }}>Partner Dashboard</h1>
                    {office && <span style={{ background: 'rgba(var(--primary-rgb),0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{office.name}</span>}
                </div>
                <div className="header-right">
                    <span className="welcome-text">Welcome, {user?.name}</span>
                    <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text)', padding: '0.5rem' }}>
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div style={{ minWidth: 0 }}>
                    {stats && (
                        <div className="stats-grid">
                            <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Registrations</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.total_registrations}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{stats.monthly_registrations} this month</div>
                            </div>
                            <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Revenue Generated</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>₹{stats.total_revenue_generated.toLocaleString()}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>₹{stats.monthly_revenue.toLocaleString()} this month</div>
                            </div>
                            <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Earned</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{stats.total_earned.toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    ₹{stats.commission_from_registrations.toLocaleString()} reg + ₹{stats.revenue_share_amount.toLocaleString()} share
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Payout</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>₹{stats.pending_payout.toLocaleString()}</div>
                                {stats.pending_payout > 0 && (
                                    <button onClick={handleRequestPayout} style={{
                                        marginTop: '1rem', padding: '0.5rem', width: '100%',
                                        background: 'var(--primary)', color: 'white', border: 'none',
                                        borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                                        fontWeight: '600', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '0.5rem'
                                    }}>
                                        <FaWallet /> Withdraw Funds
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="tab-nav">
                        <button onClick={() => setActiveTab('overview')} className="tab-button"
                            style={{ borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                            <FaBuilding /> Overview
                        </button>
                        <button onClick={() => setActiveTab('agents')} className="tab-button"
                            style={{ borderBottom: activeTab === 'agents' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'agents' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                            <FaUserTie /> My Agents
                        </button>
                        <button onClick={() => setActiveTab('registrations')} className="tab-button"
                            style={{ borderBottom: activeTab === 'registrations' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'registrations' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                            <FaHandshake /> Registrations
                        </button>
                        <button onClick={() => setActiveTab('bank-accounts')} className="tab-button"
                            style={{ borderBottom: activeTab === 'bank-accounts' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'bank-accounts' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                            <FaUniversity /> Bank Accounts
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1rem', color: 'var(--text)' }}>Commission Settings</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                                    <FaRupeeSign size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>₹{Number(stats?.commission_per_registration || 0).toLocaleString()}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Per Registration</div>
                                </div>
                                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                                    <FaStar size={24} color="#F59E0B" style={{ marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>{stats?.revenue_share_percent || 0}%</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Revenue Share</div>
                                </div>
                                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                                    <FaUserTie size={24} color="#3B82F6" style={{ marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>{agents.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Agents</div>
                                </div>
                                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                                    <FaMoneyCheck size={24} color="#10B981" style={{ marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>₹{(stats?.total_paid || 0).toLocaleString()}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Paid</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'agents' && (
                        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, color: 'var(--text)' }}>My Agents</h3>
                                <button onClick={() => setIsAgentModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaPlus /> Add Agent
                                </button>
                            </div>
                            {agents.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <FaUserTie size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No agents yet. Add your first agent to start registering users.</p>
                                </div>
                            ) : (
                                <div className="table-container" style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', minWidth: '500px' }}>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Phone</th>
                                                <th>Email</th>
                                                <th style={{ textAlign: 'center' }}>Ref Code</th>
                                                <th style={{ textAlign: 'center' }}>Login</th>
                                                <th style={{ textAlign: 'center' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {agents.map(agent => (
                                                <tr key={agent.id}>
                                                    <td style={{ fontWeight: 600 }}>{agent.name}</td>
                                                    <td>{agent.phone || '—'}</td>
                                                    <td>{agent.email || '—'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {agent.user?.reference_code ? (
                                                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px', background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                                                                {agent.user.reference_code}
                                                            </span>
                                                        ) : '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {agent.user_id ? <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>Active</span> : '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                                                            fontWeight: 'bold', textTransform: 'uppercase',
                                                            background: agent.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                            color: agent.status === 'active' ? '#10B981' : '#EF4444'
                                                        }}>{agent.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text)' }}>Recent Registrations</h3>
                            {registrations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <FaHandshake size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No registrations yet. Share your office code with new users!</p>
                                </div>
                            ) : (
                                <div className="table-container" style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', minWidth: '600px' }}>
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Matrimony ID</th>
                                                <th>Agent</th>
                                                <th style={{ textAlign: 'center' }}>Purchases</th>
                                                <th>Registered</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registrations.map((ref, i) => (
                                                <tr key={ref.id || i}>
                                                    <td><UserCell user={ref.referred_user} profile={ref.referred_user?.user_profile} avatarSize={28} /></td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{ref.referred_user?.matrimony_id || '—'}</td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ref.partner_agent?.name || '—'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            background: ref.purchased_count > 0 ? 'rgba(16,185,129,0.12)' : 'transparent',
                                                            color: ref.purchased_count > 0 ? '#10B981' : 'var(--text-secondary)',
                                                            fontWeight: 700, padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem'
                                                        }}>{ref.purchased_count || 0}</span>
                                                    </td>
                                                    <td><TimeFormatCell date={ref.created_at} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'bank-accounts' && (
                        <div style={{ background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, color: 'var(--text)' }}>Bank Accounts</h3>
                                <button onClick={() => {
                                    setBankForm({ account_name: '', account_number: '', ifsc_code: '' });
                                    setIsBankModalOpen(true);
                                }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaPlus /> Add Bank Account
                                </button>
                            </div>
                            {bankAccounts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <FaUniversity size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No bank accounts added. Add one to withdraw your earnings.</p>
                                </div>
                            ) : (
                                <div className="bank-grid">
                                    {bankAccounts.map(acc => (
                                        <div key={acc.id} style={{
                                            background: 'var(--bg)', borderRadius: '12px', padding: '1.25rem',
                                            border: acc.is_primary ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                            position: 'relative'
                                        }}>
                                            {acc.is_primary && <span style={{
                                                position: 'absolute', top: '8px', right: '8px',
                                                background: 'var(--primary)', color: 'white', padding: '2px 8px',
                                                borderRadius: '8px', fontSize: '0.65rem', fontWeight: 'bold'
                                            }}>PRIMARY</span>}
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{acc.account_name}</div>
                                            <div style={{ fontSize: '0.9rem', fontFamily: 'monospace', marginBottom: '0.25rem' }}>••••{acc.account_number?.slice(-4)}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>IFSC: {acc.ifsc_code}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isAgentModalOpen && (
                <FormModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)}
                    title="Add Agent" onSubmit={handleAddAgent} isLoading={agentSubmitting}>
                    <div className="form-group">
                        <label>Name *</label>
                        <input className="form-control" value={agentForm.name}
                            onChange={e => setAgentForm({ ...agentForm, name: e.target.value })} required />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Phone</label>
                            <input className="form-control" value={agentForm.phone}
                                onChange={e => setAgentForm({ ...agentForm, phone: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Email</label>
                            <input className="form-control" type="email" value={agentForm.email}
                                onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Create Login</label>
                            <div 
                                onClick={() => setAgentForm({ ...agentForm, create_login: !agentForm.create_login })}
                                style={{
                                    width: '44px', height: '24px', borderRadius: '12px',
                                    background: agentForm.create_login ? '#10B981' : 'var(--border-color)',
                                    position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '2px', left: agentForm.create_login ? '22px' : '2px',
                                    transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</label>
                            <div 
                                onClick={() => setAgentForm({ ...agentForm, status: agentForm.status === 'active' ? 'inactive' : 'active' })}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <div style={{
                                    width: '44px', height: '24px', borderRadius: '12px',
                                    background: agentForm.status === 'active' ? '#10B981' : 'var(--border-color)',
                                    position: 'relative', transition: 'background 0.3s'
                                }}>
                                    <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: '2px', left: agentForm.status === 'active' ? '22px' : '2px',
                                        transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: agentForm.status === 'active' ? '#10B981' : 'var(--text-secondary)' }}>
                                    {agentForm.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {agentForm.create_login && (
                        <div className="form-group">
                            <label>Password *</label>
                            <input className="form-control" type="password" value={agentForm.password}
                                onChange={e => setAgentForm({ ...agentForm, password: e.target.value })} minLength={6} required />
                        </div>
                    )}
                </FormModal>
            )}

            {isBankModalOpen && (
                <FormModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)}
                    title="Add Bank Account" onSubmit={handleAddBankAccount}>
                    <div className="form-group">
                        <label>Account Holder Name *</label>
                        <input className="form-control" value={bankForm.account_name}
                            onChange={e => setBankForm({ ...bankForm, account_name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Account Number *</label>
                        <input className="form-control" value={bankForm.account_number}
                            onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>IFSC Code *</label>
                        <input className="form-control" value={bankForm.ifsc_code}
                            onChange={e => setBankForm({ ...bankForm, ifsc_code: e.target.value })} required />
                    </div>
                </FormModal>
            )}
            <ConfirmModal
                isOpen={confirmPayoutOpen}
                onClose={() => setConfirmPayoutOpen(false)}
                onConfirm={confirmPayout}
                title="Request Payout"
                message={`Are you sure you want to request a payout of ₹${stats?.pending_payout?.toLocaleString() || 0}?`}
                confirmText="Request Payout"
                confirmButtonClass="btn-primary"
                cancelText="Cancel"
            />
            <ToastComponent />
        </div>
    );
}
