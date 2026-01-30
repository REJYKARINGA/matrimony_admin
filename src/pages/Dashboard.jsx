import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
    FaUsers, FaUserCheck, FaUserShield, FaHeart, FaMoneyBillWave,
    FaFlag, FaChartLine, FaArrowTrendUp, FaSpinner, FaClock
} from 'react-icons/fa6';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const COLORS = {
    primary: '#B47FFF',
    secondary: '#7C5CFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    chart1: '#B47FFF',
    chart2: '#7C5CFF',
    chart3: '#10B981',
    chart4: '#F59E0B',
    chart5: '#EF4444',
    chart6: '#3B82F6',
};

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



const numberVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.3
        }
    }
};

function SkeletonCard() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="skeleton-card"
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                height: '140px'
            }}
        >
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                    height: '20px',
                    width: '60%',
                    background: 'var(--border-color)',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                }}
            />
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                style={{
                    height: '32px',
                    width: '40%',
                    background: 'var(--border-color)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                }}
            />
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                style={{
                    height: '16px',
                    width: '80%',
                    background: 'var(--border-color)',
                    borderRadius: '4px'
                }}
            />
        </motion.div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { isMobile } = useOutletContext();

    useEffect(() => {
        setMounted(true);
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <FaSpinner size={32} color={COLORS.primary} />
                    </motion.div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)'
                    }}>
                        Loading Dashboard...
                    </h1>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}
                >
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </motion.div>
            </div>
        );
    }

    if (!stats) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                }}
            >
                <div style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                }}>
                    <FaClock size={48} style={{ marginBottom: '1rem' }} />
                    <div>Failed to load dashboard data</div>
                </div>
            </motion.div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.users.total,
            icon: FaUsers,
            color: COLORS.primary,
            subtitle: `${stats.users.active} active`,
            trend: '+12%',
            delay: 0
        },
        {
            title: 'Verifications',
            value: stats.verifications.pending,
            icon: FaUserShield,
            color: COLORS.warning,
            subtitle: 'pending verification',
            trend: '+8%',
            delay: 0.1
        },
        {
            title: 'Total Profiles',
            value: stats.profiles.total,
            icon: FaUserCheck,
            color: COLORS.info,
            subtitle: `${stats.profiles.verified} verified`,
            trend: '+15%',
            delay: 0.2
        },
        {
            title: 'Active Matches',
            value: stats.matches.total,
            icon: FaHeart,
            color: COLORS.danger,
            subtitle: `${stats.matches.accepted} accepted`,
            trend: '+23%',
            delay: 0.3
        },
        {
            title: 'Total Revenue',
            value: `₹${stats.payments.totalRevenue.toLocaleString()}`,
            icon: FaMoneyBillWave,
            color: COLORS.success,
            subtitle: `₹${stats.payments.revenueThisMonth.toLocaleString()} this month`,
            trend: '+18%',
            delay: 0.4
        },
        {
            title: 'Reports',
            value: stats.reports.total,
            icon: FaFlag,
            color: COLORS.danger,
            subtitle: `${stats.reports.pending} pending`,
            trend: '-5%',
            delay: 0.5
        },
    ];

    if (!mounted) return null;

    return (
        <div style={{ padding: isMobile ? '1rem' : '2rem', position: 'relative' }}>
            {/* Animated Background */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, var(--success)15 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                    zIndex: -1
                }}
                animate={{
                    background: [
                        `radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%),
                         radial-gradient(circle at 40% 40%, var(--success)15 0%, transparent 50%)`,
                        `radial-gradient(circle at 30% 70%, var(--primary)30 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, var(--secondary)30 0%, transparent 50%),
                         radial-gradient(circle at 50% 50%, var(--success)20 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%),
                         radial-gradient(circle at 40% 40%, var(--success)15 0%, transparent 50%)`
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
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        <FaChartLine size={32} color={COLORS.primary} />
                    </motion.div>
                    <h1 style={{
                        margin: 0,
                        fontSize: isMobile ? '1.5rem' : '2rem',
                        fontWeight: 'bold',
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Dashboard
                    </h1>
                </div>

                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--primary)20',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        color: 'var(--primary)',
                        fontWeight: '600',
                        border: '1px solid var(--primary)30'
                    }}
                >
                    <FaArrowTrendUp style={{ marginRight: '0.5rem' }} />
                    Live Data
                </motion.div>
            </motion.div>

            {/* Stat Cards Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(100%, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                {statCards.map((card, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover="hover"
                        style={{
                            background: `
                                linear-gradient(135deg, 
                                    var(--card-bg) 0%, 
                                    var(--card-bg)cc 100%
                                )`,
                            border: `1px solid var(--border-color)`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 4px 24px var(--shadow-color)'
                        }}
                    >
                        {/* Decorative gradient background */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: `radial-gradient(circle, ${card.color}30 0%, transparent 70%)`,
                                filter: 'blur(20px)'
                            }}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            <div style={{ flex: 1 }}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: card.delay + 0.1 }}
                                    style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.5rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    {card.title}
                                </motion.div>

                                <motion.div
                                    variants={numberVariants}
                                    style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: 'var(--text-primary)',
                                        marginBottom: '0.25rem'
                                    }}
                                >
                                    {card.value}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: card.delay + 0.3 }}
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span>{card.subtitle}</span>
                                    <span className={`badge ${card.trend.startsWith('+') ? 'badge-success' : 'badge-danger'}`}>
                                        {card.trend}
                                    </span>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    delay: card.delay + 0.2,
                                    stiffness: 200
                                }}
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${card.color}40, ${card.color}20)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 8px 24px ${card.color}30`
                                }}
                            >
                                <card.icon size={28} color={card.color} />
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: '2rem'
                }}
            >
                {/* User Growth Chart */}
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaUsers color={COLORS.primary} />
                        User Growth Trend
                    </motion.h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats.users.growth}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke={COLORS.primary}
                                strokeWidth={3}
                                fill="url(#colorUsers)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Revenue Growth Chart */}
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaMoneyBillWave color={COLORS.success} />
                        Revenue Analytics
                    </motion.h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.payments.revenueGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                fill={COLORS.success}
                                name="Revenue (₹)"
                                radius={[8, 8, 0, 0]}
                                animationDuration={2000}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Gender Distribution */}
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px var(--shadow-color)',
                    }}
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaUserCheck color={COLORS.info} />
                        Gender Distribution
                    </motion.h2>
                    <div style={{ padding: '1rem 0' }}>
                        {/* Summary Stats */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1.5rem',
                            gap: '1rem'
                        }}>
                            {stats.profiles.genderDistribution.map((item, index) => (
                                <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: index === 0 ? COLORS.info : COLORS.danger
                                    }}>
                                        {item.count}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {item.gender}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            height: '24px',
                            width: '100%',
                            background: 'var(--border-color)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            display: 'flex',
                            position: 'relative'
                        }}>
                            {stats.profiles.genderDistribution.map((item, index) => {
                                const total = stats.profiles.genderDistribution.reduce((a, b) => a + b.count, 0);
                                const percent = (item.count / total) * 100;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                                        style={{
                                            background: index === 0 ? COLORS.info : COLORS.danger,
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title={`${item.gender}: ${percent.toFixed(1)}%`}
                                    />
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                        }}>
                            {stats.profiles.genderDistribution.map((item, index) => {
                                const total = stats.profiles.genderDistribution.reduce((a, b) => a + b.count, 0);
                                const percent = (item.count / total) * 100;
                                return (
                                    <span key={index}>
                                        {percent.toFixed(1)}%
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Verification Status */}
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px var(--shadow-color)',
                    }}
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '1.5rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaUserShield color={COLORS.warning} />
                        Verification Status
                    </motion.h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                        {stats.verifications.distribution.map((item, index) => {
                            const total = stats.verifications.distribution.reduce((a, b) => a + b.count, 0);
                            const percent = total > 0 ? (item.count / total) * 100 : 0;
                            const color = [COLORS.warning, COLORS.success, COLORS.danger][index % 3];

                            return (
                                <div key={index}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        <span>{item.status}</span>
                                        <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                                    </div>
                                    <div style={{
                                        height: '10px',
                                        width: '100%',
                                        background: 'var(--border-color)',
                                        borderRadius: '5px',
                                        overflow: 'hidden'
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 1, delay: 0.8 + (index * 0.1) }}
                                            style={{
                                                height: '100%',
                                                background: color,
                                                borderRadius: '5px'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        textAlign: 'right',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {percent.toFixed(1)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}