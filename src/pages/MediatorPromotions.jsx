import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEdit,
    FaTrash,
    FaExternalLinkAlt,
    FaCheck,
    FaCheckCircle,
    FaBullhorn,
    FaEye,
    FaThumbsUp,
    FaComment,
    FaMoneyBillWave,
    FaHistory,
    FaFilter,
    FaSearch
} from 'react-icons/fa';
import api from '../api/axios';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

const rowHoverVariants = {
    hover: {
        y: -2,
        backgroundColor: 'var(--hover-bg)',
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    }
};

export default function MediatorPromotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        status: 'pending',
        calculated_payout: ''
    });

    useEffect(() => {
        setMounted(true);
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/mediator-promotions');
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

    const stats = {
        totalPromotions: promotions.length,
        totalViews: promotions.reduce((acc, p) => acc + Number(p.views_count), 0),
        totalPaid: promotions.reduce((acc, p) => acc + Number(p.total_paid_amount || 0), 0),
        totalPending: promotions.reduce((acc, p) => acc + calculatePayable(p), 0)
    };

    const filteredPromotions = promotions.filter(p => {
        const query = search.toLowerCase();
        const matchesSearch = (p.user?.name || '').toLowerCase().includes(query) ||
            (p.user?.email || '').toLowerCase().includes(query) ||
            p.platform.toLowerCase().includes(query);

        const matchesFilter = filter === 'all' || p.status === filter;

        return matchesSearch && matchesFilter;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/mediator-promotions/${editingId}`, formData);
            fetchPromotions();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update promotion:', error);
            alert('Failed to update promotion');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) return;
        try {
            await api.delete(`/admin/mediator-promotions/${id}`);
            fetchPromotions();
        } catch (error) {
            console.error('Failed to delete promotion:', error);
        }
    };

    const handlePayClick = (promo) => {
        setSelectedPromotion(promo);
        setIsPayModalOpen(true);
    };

    const handleProcessPayment = async () => {
        setSubmitting(true);
        try {
            await api.put(`/admin/mediator-promotions/${selectedPromotion.id}`, {
                status: 'paid'
            });
            setIsPayModalOpen(false);
            fetchPromotions();
        } catch (error) {
            console.error('Failed to process payment:', error);
            alert('Failed to process payment');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (promotion) => {
        setEditingId(promotion.id);
        setFormData({
            views_count: promotion.views_count,
            likes_count: promotion.likes_count,
            comments_count: promotion.comments_count,
            status: promotion.status,
            calculated_payout: promotion.calculated_payout
        });
        setIsModalOpen(true);
    };

    if (!mounted) return null;

    return (
        <div style={{ padding: '2rem', position: 'relative' }}>
            {/* Animated Background */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 80%, var(--primary)15 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, var(--secondary)15 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                    zIndex: -1
                }}
                animate={{
                    background: [
                        `radial-gradient(circle at 20% 80%, var(--primary)15 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)15 0%, transparent 50%)`,
                        `radial-gradient(circle at 30% 70%, var(--primary)25 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, var(--secondary)25 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, var(--primary)15 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)15 0%, transparent 50%)`
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                >
                    <FaBullhorn size={32} color="var(--primary)" />
                </motion.div>
                <h1 style={{
                    margin: 0,
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Mediator Promotions
                </h1>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                        background: 'radial-gradient(circle, var(--primary)30 0%, transparent 70%)',
                        filter: 'blur(20px)'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaBullhorn size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Promotions
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {stats.totalPromotions}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                        background: 'radial-gradient(circle, var(--info)30 0%, transparent 70%)',
                        filter: 'blur(20px)'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaEye size={24} color="var(--info)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Views
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {stats.totalViews.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                        background: 'radial-gradient(circle, var(--success)30 0%, transparent 70%)',
                        filter: 'blur(20px)'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaCheckCircle size={24} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Paid
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            ₹{stats.totalPaid.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, right: 0, width: '80px', height: '80px',
                        background: 'radial-gradient(circle, var(--warning)30 0%, transparent 70%)',
                        filter: 'blur(20px)'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaMoneyBillWave size={24} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Payable
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            ₹{stats.totalPending.toLocaleString()}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Promotions History</h2>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search mediators..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                paddingLeft: '40px',
                                width: '250px',
                                marginBottom: 0,
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '10px'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <FaFilter style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '10px',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                minWidth: '160px'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="paid">Paid</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Table Container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    overflow: 'hidden'
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'inline-block' }}
                        >
                            <FaBullhorn size={32} color="var(--primary)" />
                        </motion.div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading promotions...</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Mediator</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Platform</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Link</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Stats (V/L/C)</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Payable Amount</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Pending Payout</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Remarks</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Total Paid</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Updated</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode='wait'>
                                        {filteredPromotions.map((promo, index) => (
                                            <motion.tr
                                                key={promo.id}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: -100 }}
                                                whileHover={{ backgroundColor: 'var(--hover-bg)' }}
                                                transition={{ delay: index * 0.05 }}
                                                style={{ borderBottom: '1px solid var(--border-color)' }}
                                            >
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{promo.user?.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{promo.user?.email}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        textTransform: 'capitalize',
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
                                                <td style={{ padding: '1rem' }}>
                                                    <a href={promo.link} target="_blank" rel="noopener noreferrer" style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        color: 'var(--primary)',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(var(--primary-rgb), 0.05)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        View <FaExternalLinkAlt size={10} />
                                                    </a>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                                        <span title="Views" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaEye size={12} color="var(--info)" /> {promo.views_count.toLocaleString()}</span>
                                                        <span title="Likes" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaThumbsUp size={12} color="var(--secondary)" /> {promo.likes_count.toLocaleString()}</span>
                                                        <span title="Comments" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaComment size={12} color="var(--primary)" /> {promo.comments_count.toLocaleString()}</span>
                                                    </div>
                                                    {promo.setting && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                                                            Target: {promo.setting.views_required.toLocaleString()}V
                                                            {promo.setting.is_likes_enabled && ` / ${promo.setting.likes_required.toLocaleString()}L`}
                                                            {promo.setting.is_comments_enabled && ` / ${promo.setting.comments_required.toLocaleString()}C`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1rem',
                                                        color: calculatePayable(promo) > 0 ? '#4CAF50' : 'var(--text-secondary)',
                                                        background: calculatePayable(promo) > 0 ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        display: 'inline-block',
                                                        minWidth: '100px',
                                                        border: calculatePayable(promo) > 0 ? '1px solid rgba(76, 175, 80, 0.2)' : 'none'
                                                    }}>
                                                        ₹{calculatePayable(promo).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem',
                                                        color: Number(promo.calculated_payout) > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                                                        opacity: 0.8
                                                    }}>
                                                        ₹{Number(promo.calculated_payout).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {promo.setting ? (() => {
                                                        const payable = calculatePayable(promo);
                                                        const payout_rate = Number(promo.setting.payout_amount);
                                                        const pendingUnits = Math.round(payable / payout_rate);
                                                        const paidUnits = Math.round(Number(promo.total_paid_amount) / payout_rate);

                                                        if (payable > 0) {
                                                            return (
                                                                <div style={{ color: '#4CAF50' }}>
                                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Eligible: {pendingUnits} more unit(s)</div>
                                                                    <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>
                                                                        {pendingUnits} × ₹{payout_rate}
                                                                    </div>
                                                                    {paidUnits > 0 && (
                                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                                            Total: {paidUnits + pendingUnits} (Paid: {paidUnits})
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }

                                                        const viewsPerUnit = Number(promo.setting.views_required) || 1;
                                                        const totalViewUnits = Math.floor(Number(promo.views_count) / viewsPerUnit);
                                                        const vReq = Number(promo.setting.views_required);

                                                        if (totalViewUnits === 0) {
                                                            return <span style={{ color: '#F44336', fontSize: '0.85rem' }}>Need {vReq - promo.views_count} more Views</span>;
                                                        }

                                                        if (Number(promo.total_paid_amount) > 0) {
                                                            return <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Full paid for {totalViewUnits} unit(s)</span>;
                                                        }

                                                        return <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No pending payout</span>;
                                                    })() : '-'}
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: '600' }}>₹{Number(promo.total_paid_amount || 0).toLocaleString()}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span className={`status-badge status-${promo.status}`} style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {promo.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}><TimeFormatCell date={promo.updated_at} /></td>

                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="icon-btn edit"
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(promo); }}
                                                            title="Edit / Verify"
                                                            style={{
                                                                background: 'rgba(var(--primary-rgb), 0.1)',
                                                                color: 'var(--primary)',
                                                                border: 'none',
                                                                padding: '8px',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FaEdit />
                                                        </motion.button>

                                                        {calculatePayable(promo) > 0 && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="icon-btn success"
                                                                style={{
                                                                    background: 'var(--success)',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '8px 14px',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    width: 'auto',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                                onClick={(e) => { e.stopPropagation(); handlePayClick(promo); }}
                                                                title={`Pay ₹${calculatePayable(promo).toLocaleString()}`}
                                                            >
                                                                <FaCheck /> Pay
                                                            </motion.button>
                                                        )}

                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="icon-btn delete"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(promo.id); }}
                                                            title="Delete"
                                                            style={{
                                                                background: 'rgba(244, 67, 54, 0.1)',
                                                                color: '#F44336',
                                                                border: 'none',
                                                                padding: '8px',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {filteredPromotions.length === 0 && (
                                        <tr>
                                            <td colSpan="11" style={{ textAlign: 'center', padding: '3rem' }}>
                                                <div style={{ color: 'var(--text-secondary)' }}>
                                                    <FaBullhorn size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                    <p>No promotions found matching your criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Pagination / Summary Counter */}
            {filteredPromotions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
                >
                    Showing {filteredPromotions.length} of {promotions.length} promotions
                </motion.div>
            )}

            {/* Modal Components */}
            {isModalOpen && (
                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Update Promotion Status"
                    onSubmit={handleSubmit}
                    isLoading={submitting}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Views Count</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.views_count}
                                onChange={e => setFormData({ ...formData, views_count: e.target.value })}
                                min="0"
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Likes Count</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.likes_count}
                                onChange={e => setFormData({ ...formData, likes_count: e.target.value })}
                                min="0"
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Comments Count</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.comments_count}
                                onChange={e => setFormData({ ...formData, comments_count: e.target.value })}
                                min="0"
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Status</label>
                            <select
                                className="form-control"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                style={{ borderRadius: '8px' }}
                            >
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Calculated Payout (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.calculated_payout}
                                onChange={e => setFormData({ ...formData, calculated_payout: e.target.value })}
                                min="0"
                                step="0.01"
                                style={{ borderRadius: '8px' }}
                            />
                            <small style={{ color: 'var(--text-secondary)' }}>Leave as is to auto-calculate based on counts</small>
                        </div>
                    </div>
                </FormModal>
            )}

            {isPayModalOpen && (
                <div className="modal-overlay">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="modal-content"
                        style={{ maxWidth: '400px', borderRadius: '24px', padding: '10px' }}
                    >
                        <div className="modal-header" style={{ padding: '20px 24px 0' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>Process Payment</h2>
                            <button onClick={() => setIsPayModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>&times;</button>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
                            <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '16px' }}>
                                <FaCheckCircle />
                            </div>
                            <h3 style={{ marginBottom: '8px', fontSize: '1.4rem', fontWeight: 'bold' }}>Confirm Payout</h3>
                            <div style={{
                                fontSize: '2.2rem',
                                fontWeight: '900',
                                color: 'var(--primary)',
                                marginBottom: '20px',
                                background: 'rgba(var(--primary-rgb), 0.1)',
                                padding: '16px',
                                borderRadius: '16px',
                                border: '1px solid rgba(var(--primary-rgb), 0.2)'
                            }}>
                                ₹{calculatePayable(selectedPromotion).toLocaleString()}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                This will mark the pending payout for <strong style={{ color: 'var(--text-primary)' }}>{selectedPromotion?.user?.name || selectedPromotion?.user?.email}</strong> as paid and update their total earnings history.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className="cancel-btn"
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: '1px solid var(--border)',
                                        background: 'transparent',
                                        fontWeight: '600'
                                    }}
                                    onClick={() => setIsPayModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="submit-btn"
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'var(--success)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                                    }}
                                    onClick={handleProcessPayment}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Processing...' : 'Confirm & Paid'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
