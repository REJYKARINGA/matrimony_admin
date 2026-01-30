import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaPlus, FaExternalLinkAlt, FaSignOutAlt, FaBullhorn, FaMoon, FaSun } from 'react-icons/fa';
import FormModal from '../components/FormModal';

export default function MediatorDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [formData, setFormData] = useState({
        platform: '',
        link: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('admin_user') || '{}');

        if (!token || userData.role !== 'mediator') {
            navigate('/');
            return;
        }

        setUser(userData);
        fetchPromotions();
    }, [navigate]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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
                alignItems: 'center'
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
            <div style={{ padding: '2rem' }}>
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
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Earnings</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>
                            ₹{promotions.reduce((sum, p) => sum + Number(p.calculated_payout || 0), 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="stat-card" style={{
                        background: 'var(--card-bg)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Paid</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
                            ₹{promotions.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.calculated_payout || 0), 0).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Promotions Section */}
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
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Platform</th>
                                        <th>Link</th>
                                        <th>Views</th>
                                        <th>Likes</th>
                                        <th>Comments</th>
                                        <th>Payout</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promotions.map((promo) => (
                                        <tr key={promo.id}>
                                            <td style={{ textTransform: 'capitalize' }}>{promo.platform}</td>
                                            <td>
                                                <a
                                                    href={promo.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}
                                                >
                                                    View <FaExternalLinkAlt size={12} />
                                                </a>
                                            </td>
                                            <td>{Number(promo.views_count).toLocaleString()}</td>
                                            <td>{Number(promo.likes_count).toLocaleString()}</td>
                                            <td>{Number(promo.comments_count).toLocaleString()}</td>
                                            <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                                ₹{Number(promo.calculated_payout).toLocaleString()}
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    background: `${getStatusColor(promo.status)}20`,
                                                    color: getStatusColor(promo.status),
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {promo.status}
                                                </span>
                                            </td>
                                            <td>{new Date(promo.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Modal */}
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
                            <option value="facebook">Facebook</option>
                            <option value="tiktok">TikTok</option>
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
                            Paste the direct link to your promotional video or post
                        </small>
                    </div>
                </FormModal>
            )}
        </div>
    );
}
