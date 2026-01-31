import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaPlus, FaExternalLinkAlt, FaSignOutAlt, FaBullhorn, FaMoon, FaSun } from 'react-icons/fa';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';


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
                            ₹{promotions.reduce((sum, p) => sum + Number(p.total_paid_amount || 0) + Number(p.calculated_payout || 0), 0).toLocaleString()}
                        </div>
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
                                        <th>Last Updated</th>

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
                                            <td>
                                                <div style={{ fontWeight: 'bold', color: Number(promo.calculated_payout) > 0 ? 'var(--primary)' : 'inherit' }}>
                                                    {Number(promo.calculated_payout) > 0 ? `Pending: ₹${Number(promo.calculated_payout).toLocaleString()}` : 'No Pending Payout'}
                                                </div>
                                                {Number(promo.total_paid_amount) > 0 && (
                                                    <div style={{ fontSize: '0.8rem', color: '#4CAF50', marginTop: '2px' }}>
                                                        Paid: ₹{Number(promo.total_paid_amount).toLocaleString()}
                                                    </div>
                                                )}
                                                {promo.setting ? (() => {
                                                    const vMult = Math.floor(promo.views_count / (promo.setting.views_required || 1));
                                                    let finalMult = vMult;

                                                    if (promo.setting.is_likes_enabled) {
                                                        const lMult = Math.floor(promo.likes_count / (promo.setting.likes_required || 1));
                                                        finalMult = Math.min(finalMult, lMult);
                                                    }

                                                    if (promo.setting.is_comments_enabled) {
                                                        const cMult = Math.floor(promo.comments_count / (promo.setting.comments_required || 1));
                                                        finalMult = Math.min(finalMult, cMult);
                                                    }

                                                    const viewsPerUnit = Number(promo.setting.views_required) || 1;
                                                    const totalViewUnits = Math.floor(Number(promo.views_count) / viewsPerUnit);

                                                    if (Number(promo.calculated_payout) > 0) {
                                                        const currentUnits = Math.floor(Number(promo.calculated_payout) / Number(promo.setting.payout_amount));
                                                        return (
                                                            <div style={{ fontSize: '0.7rem', color: '#4CAF50', marginTop: '4px' }}>
                                                                Ready for {currentUnits} unit(s)
                                                            </div>
                                                        );
                                                    }

                                                    const vReq = Number(promo.setting.views_required);
                                                    const lReq = promo.setting.is_likes_enabled ? Number(promo.setting.likes_required) : 0;
                                                    const cReq = promo.setting.is_comments_enabled ? Number(promo.setting.comments_required) : 0;

                                                    const lUnits = lReq > 0 ? Math.floor(Number(promo.likes_count) / lReq) : 999999;
                                                    const cUnits = cReq > 0 ? Math.floor(Number(promo.comments_count) / cReq) : 999999;

                                                    const finalUnits = Math.min(totalViewUnits, lUnits, cUnits);

                                                    if (totalViewUnits > 0 && finalUnits < totalViewUnits) {
                                                        const bottleneck = lUnits < totalViewUnits && lUnits <= cUnits ? 'Likes' : 'Comments';
                                                        const needAmt = (totalViewUnits * (bottleneck === 'Likes' ? lReq : cReq)) - (bottleneck === 'Likes' ? promo.likes_count : promo.comments_count);

                                                        return (
                                                            <div style={{ fontSize: '0.7rem', color: '#F44336', marginTop: '4px', lineHeight: '1.2' }}>
                                                                Views reached {totalViewUnits} units, but need {needAmt} more {bottleneck} to unlock full payout.
                                                            </div>
                                                        );
                                                    }

                                                    if (totalViewUnits === 0) {
                                                        return (
                                                            <div style={{ fontSize: '0.7rem', color: '#F44336', marginTop: '4px' }}>
                                                                Need {vReq - promo.views_count} more views for 1st unit
                                                            </div>
                                                        );
                                                    }

                                                    if (Number(promo.total_paid_amount) > 0) {
                                                        return (
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                                Already paid for latest milestones
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                            No pending payout
                                                        </div>
                                                    );
                                                })() : null}
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
                                            <td><TimeFormatCell date={promo.created_at} /></td>
                                            <td><TimeFormatCell date={promo.updated_at} /></td>

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
                                Required for automatic stats fetching via Business Discovery.
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
                            <strong>Note:</strong> Stats (views, likes, comments) will be manually verified by admin after submission.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Due to platform API restrictions, automatic fetching is not available. Admin will review your submission and update the counts.
                        </p>
                    </div>
                </FormModal>
            )}
        </div>
    );
}
