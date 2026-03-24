import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
    PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    LuUsers, LuUserCheck, LuUserPlus, LuHeart, LuCreditCard,
    LuTriangleAlert, LuTrendingUp, LuLoader, LuClock,
    LuWallet, LuGraduationCap, LuTarget, LuShieldCheck, LuMessageSquare
} from 'react-icons/lu';
import {
    FaUsers, FaUserCheck, FaUserShield, FaHeart, FaMoneyBillWave,
    FaFlag, FaChartLine, FaArrowTrendUp, FaSpinner, FaClock,
    FaWallet, FaGraduationCap, FaBullseye, FaArrowRotateLeft
} from 'react-icons/fa6';
import { CONFIG } from '../config';

const API_URL = CONFIG.API_URL;

const COLORS = {
    primary: '#1565c0',
    secondary: '#1e88e5',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#42a5f5',
    chart1: '#1565c0',
    chart2: '#1e88e5',
    chart3: '#42a5f5',
    chart4: '#F59E0B',
    chart5: '#EF4444',
    chart6: '#10B981',
    female: '#ec4899',
    male: '#1565c0'
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
    const { theme, isMobile } = useOutletContext();
    const isDark = theme === 'dark';

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
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                        <LuLoader size={32} color={COLORS.primary} />
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
                    <LuClock size={48} style={{ marginBottom: '1rem' }} />
                    <div>Failed to load dashboard data</div>
                </div>
            </motion.div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.users?.total ?? 0,
            icon: LuUsers,
            color: COLORS.primary,
            subtitle: `${stats?.users?.active ?? 0} active members`,
            delay: 0
        },
        {
            title: 'Verifications',
            value: stats?.verifications?.pending ?? 0,
            icon: LuShieldCheck,
            color: COLORS.warning,
            subtitle: `${stats?.verifications?.approved ?? 0} verified`,
            delay: 0.1
        },
        {
            title: 'Connections',
            value: stats?.interests?.total ?? 0,
            icon: LuHeart,
            color: '#6366f1',
            subtitle: `${stats?.interests?.accepted ?? 0} accepted`,
            delay: 0.2
        },
        {
            title: 'Revenue Flow',
            value: `₹${(stats?.payments?.totalRevenue ?? 0).toLocaleString()}`,
            icon: LuCreditCard,
            color: COLORS.success,
            subtitle: `₹${(stats?.payments?.revenueThisMonth ?? 0).toLocaleString()} current`,
            delay: 0.3
        },
        {
            title: 'Security Alert',
            value: stats?.reports?.pending ?? 0,
            icon: LuTriangleAlert,
            color: COLORS.danger,
            subtitle: `${stats?.reports?.total ?? 0} total cases`,
            delay: 0.4
        },
        {
            title: 'Customer Stories',
            value: stats?.successStories?.approved ?? 0,
            icon: LuMessageSquare,
            color: '#8b5cf6',
            subtitle: `${stats?.successStories?.total ?? 0} stories shared`,
            delay: 0.5
        }
    ];

    if (!mounted) return null;

    return (
        <div style={{ padding: isMobile ? '1rem 0' : '0 0 2rem 0', position: 'relative' }}>
            {/* Animated Background */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 80%, rgba(21, 101, 192, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(30, 136, 229, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                    zIndex: -1
                }}
                animate={{
                    background: [
                        `radial-gradient(circle at 20% 80%, rgba(21, 101, 192, 0.08) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, rgba(30, 136, 229, 0.08) 0%, transparent 50%),
                         radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)`,
                        `radial-gradient(circle at 30% 70%, rgba(21, 101, 192, 0.12) 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, rgba(30, 136, 229, 0.12) 0%, transparent 50%),
                         radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, rgba(21, 101, 192, 0.08) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, rgba(30, 136, 229, 0.08) 0%, transparent 50%),
                         radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)`
                    ]
                }}
                transition={{ duration: 15, repeat: Infinity }}
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
                    marginBottom: '2.5rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                        style={{
                            width: '48px',
                            height: '48px',
                            background: 'white',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <FaChartLine size={24} color={COLORS.primary} />
                    </motion.div>
                    <h1 style={{
                        margin: 0,
                        fontSize: isMobile ? '1.5rem' : '2.2rem',
                        fontWeight: '900',
                        letterSpacing: '-1px',
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Premium Analytics
                    </h1>
                </div>

                <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        padding: '0.6rem 1.2rem',
                        background: 'var(--card-bg)',
                        borderRadius: '24px',
                        fontSize: '0.875rem',
                        color: COLORS.primary,
                        fontWeight: '700',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <div style={{ width: '8px', height: '8px', background: COLORS.success, borderRadius: '50%' }} />
                    Live System Feed
                </motion.div>
            </motion.div>

            {/* 12-Column Premium Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
                gap: '1.5rem',
                position: 'relative',
                paddingBottom: '4rem'
            }}>

                {/* Hero Stats (Top 4) */}
                {statCards.slice(0, 4).map((card, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}
                        style={{
                            gridColumn: isMobile ? 'span 1' : 'span 3',
                            background: 'var(--card-bg)',
                            borderRadius: '32px',
                            padding: '1.8rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '1.2rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            minHeight: '160px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '20px',
                                background: `${card.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: card.color
                            }}>
                                <card.icon size={26} />
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: COLORS.success,
                                fontWeight: 'bold',
                                padding: '0.4rem 0.8rem',
                                background: `${COLORS.success}15`,
                                borderRadius: '12px'
                            }}>
                                +12%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{card.title}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text)', marginTop: '0.2rem' }}>
                                {card.value}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{card.subtitle}</div>
                        </div>
                    </motion.div>
                ))}

                {/* Row 2: Engagement Matrix */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 8',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        minHeight: '480px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)' }}>Engagement Matrix</h2>
                            <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>User registrations growth (Last 12 Months)</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={380}>
                        <AreaChart data={stats?.users?.growth || []}>
                            <defs>
                                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.01} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} dy={15} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} dx={-15} />
                            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1.2rem' }} />
                            <Area type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={5} fill="url(#colorEngagement)" dot={{ fill: '#fff', stroke: COLORS.primary, strokeWidth: 3, r: 7 }} activeDot={{ r: 9, strokeWidth: 0, fill: COLORS.secondary }} animationDuration={2500} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Network Health */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 4',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '2.5rem',
                        minHeight: '480px'
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text)' }}>Network Health</h2>
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart cx="50%" cy="55%" outerRadius="80%" data={[
                            { subject: 'Users', A: stats?.users?.active || 0, fullMark: stats?.users?.total || 100 },
                            { subject: 'Verified', A: stats?.verifications?.approved || 0, fullMark: stats?.users?.total || 100 },
                            { subject: 'Revenue', A: stats?.payments?.revenueThisMonth || 0, fullMark: 10000 },
                            { subject: 'Interests', A: stats?.interests?.accepted || 0, fullMark: stats?.interests?.total || 100 },
                            { subject: 'Stories', A: stats?.successStories?.approved || 0, fullMark: stats?.successStories?.total || 100 },
                        ]}>
                            <PolarGrid stroke={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: '600' }} />
                            <Radar name="System" dataKey="A" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.4} animationDuration={3000} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: COLORS.success, fontWeight: '900', fontSize: '2.5rem' }}>A+</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>Overall Reliability Score</div>
                    </div>
                </motion.div>

                {/* Row 3: Revenue Momentum */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 6',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        minHeight: '400px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text)' }}>Revenue Momentum</h2>
                            <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Financial performance indicators</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: COLORS.success }}>
                                ₹{stats?.payments?.totalRevenue?.toLocaleString() ?? 0}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>LIFETIME PROFIT</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stats?.payments?.revenueGrowth || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', background: 'var(--card-bg)', color: 'var(--text)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="amount" fill={COLORS.success} radius={[6, 6, 0, 0]} animationDuration={3000} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Match Outcomes & Demographics */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 3',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        minHeight: '400px'
                    }}
                >
                    <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)', textAlign: 'center' }}>Match Success</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={stats?.matches?.distribution || []} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="count" nameKey="status">
                                {(stats?.matches?.distribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.success : COLORS.warning} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        {stats?.matches?.distribution?.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? COLORS.success : COLORS.warning }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{d.status}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 3',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        minHeight: '400px'
                    }}
                >
                    <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)', textAlign: 'center' }}>User Demographics</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={stats?.profiles?.genderDistribution || []} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="count" nameKey="gender">
                                {(stats?.profiles?.genderDistribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.male : COLORS.female} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        {stats?.profiles?.genderDistribution?.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? COLORS.male : COLORS.female }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{d.gender}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Row 4: Operational Pulse */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 7',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        minHeight: '420px'
                    }}
                >
                    <h2 style={{ margin: '0 0 2rem', fontSize: '1.3rem', fontWeight: '800', color: 'var(--text)' }}>Operational Pipeline</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {[
                            { label: 'Pending Verifications', count: stats?.verifications?.pending ?? 0, color: COLORS.warning, total: (stats?.verifications?.approved + stats?.verifications?.pending + stats?.verifications?.rejected) || 1 },
                            { label: 'Verified Community Members', count: stats?.verifications?.approved ?? 0, color: COLORS.success, total: (stats?.verifications?.approved + stats?.verifications?.pending + stats?.verifications?.rejected) || 1 },
                            { label: 'Unresolved Reports', count: stats?.reports?.pending ?? 0, color: COLORS.danger, total: stats?.reports?.total || 1 },
                            { label: 'Published Success Stories', count: stats?.successStories?.approved ?? 0, color: COLORS.primary, total: stats?.successStories?.total || 1 },
                        ].map((item, index) => (
                            <div key={index}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem', fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>
                                    <span>{item.label}</span>
                                    <span>{item.count}</span>
                                </div>
                                <div style={{ height: '14px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: '7px', overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}` }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / item.total) * 100}%` }} transition={{ duration: 1.5, delay: 0.5 }} style={{ height: '100%', background: item.color, borderRadius: '7px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Global Integrity Breakdown */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 5',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2.5rem',
                        minHeight: '420px'
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: 'var(--text)' }}>Global Integrity</h2>
                    <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats?.verifications?.distribution || []} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={5} dataKey="count">
                                    {(stats?.verifications?.distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={[COLORS.warning, COLORS.success, COLORS.danger][index % 3]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--text)' }}>
                                {Math.round((stats?.verifications?.approved / ((stats?.verifications?.approved + stats?.verifications?.pending + stats?.verifications?.rejected) || 1)) * 100)}%
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Verified</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
                        {[
                            { label: 'Pending', color: COLORS.warning, count: stats?.verifications?.pending },
                            { label: 'Approved', color: COLORS.success, count: stats?.verifications?.approved },
                            { label: 'Rejected', color: COLORS.danger, count: stats?.verifications?.rejected },
                        ].map((item, i) => (
                            <div key={i}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: item.color }}>{item.count}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Row 5: Community Demographics */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: 'span 12',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '3rem',
                        boxShadow: '0 15px 45px rgba(0,0,0,0.04)',
                        border: '1px solid var(--border-color)',
                        minHeight: '400px',
                        marginTop: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: 'var(--text)' }}>Community Diversity</h2>
                            <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500' }}>Active member distribution by religious background</p>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={stats?.profiles?.religionDistribution || []} layout="vertical" margin={{ left: 40, right: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} hide />
                            <YAxis dataKey="religion" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 14, fontWeight: '700' }} width={120} />
                            <Tooltip cursor={{ fill: 'var(--hover-bg)' }} contentStyle={{ background: 'var(--card-bg)', border: 'none', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={40} animationDuration={3000}>
                                {(stats?.profiles?.religionDistribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, '#6366f1', '#ec4899'][index % 7]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Final Row: Repository & Security Metrics */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: 'span 12',
                        background: 'var(--card-bg)',
                        borderRadius: '40px',
                        padding: '3rem',
                        boxShadow: '0 15px 45px rgba(0,0,0,0.04)',
                        border: '1px solid var(--border-color)',
                        minHeight: '400px',
                        marginTop: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'var(--text)' }}>Database Repository Hub</h2>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>Master data distribution across mandatory system entities</p>
                        </div>
                        <div style={{ display: 'flex', gap: '3rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: COLORS.primary }}>{stats?.audit?.activityLogs?.toLocaleString() ?? 0}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Log Capacity</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: COLORS.secondary }}>{stats?.audit?.logsToday ?? 0}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Activity Today</div>
                            </div>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={[
                                { name: 'Educations', count: stats?.dataManagement?.education || 0 },
                                { name: 'Occupations', count: stats?.dataManagement?.occupation || 0 },
                                { name: 'Religions', count: stats?.dataManagement?.religions || 0 },
                                { name: 'Castes', count: stats?.dataManagement?.castes || 0 },
                                { name: 'Library', count: stats?.interests?.libraryTotal || 0 },
                                { name: 'Posters', count: stats?.content?.posters || 0 },
                                { name: 'Unlocks', count: stats?.unlocks?.total || 0 },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text)', fontSize: 13, fontWeight: '700' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} />
                            <Tooltip cursor={{ fill: 'var(--hover-bg)' }} contentStyle={{ background: 'var(--card-bg)', border: 'none', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={60} animationDuration={3000}>
                                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                    <Cell key={i} fill={[COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, '#6366f1', '#ec4899'][i % 7]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
}