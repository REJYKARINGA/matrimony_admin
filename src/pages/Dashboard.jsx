import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
    PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
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
            value: stats?.users?.total ?? 0,
            icon: FaUsers,
            color: COLORS.primary,
            subtitle: `${stats?.users?.active ?? 0} active members`,
            delay: 0
        },
        {
            title: 'Verifications',
            value: stats?.verifications?.pending ?? 0,
            icon: FaUserShield,
            color: COLORS.warning,
            subtitle: `${stats?.verifications?.approved ?? 0} verified total`,
            delay: 0.1
        },
        {
            title: 'Interests Sent',
            value: stats?.interests?.total ?? 0,
            icon: FaHeart,
            color: '#6366f1',
            subtitle: `${stats?.interests?.accepted ?? 0} connections`,
            delay: 0.2
        },
        {
            title: 'Total Revenue',
            value: `₹${(stats?.payments?.totalRevenue ?? 0).toLocaleString()}`,
            icon: FaMoneyBillWave,
            color: COLORS.success,
            subtitle: `₹${(stats?.payments?.revenueThisMonth ?? 0).toLocaleString()} this month`,
            delay: 0.3
        },
        {
            title: 'Wallet Balance',
            value: `₹${(stats?.payments?.walletBalance ?? 0).toLocaleString()}`,
            icon: FaWallet,
            color: COLORS.secondary,
            subtitle: `${stats?.payments?.walletTransactions ?? 0} transactions`,
            delay: 0.4
        },
        {
            title: 'Posters',
            value: stats?.content?.posters ?? 0,
            icon: FaBullseye,
            color: COLORS.info,
            subtitle: `${stats?.content?.postersVerified ?? 0} verified announcements`,
            delay: 0.5
        },
        {
            title: 'Stories',
            value: stats?.successStories?.total ?? 0,
            icon: FaHeart,
            color: COLORS.danger,
            subtitle: `${stats?.successStories?.approved ?? 0} approved stories`,
            delay: 0.6
        },
        {
            title: 'Library Data',
            value: (stats?.dataManagement?.education ?? 0) + (stats?.dataManagement?.occupation ?? 0),
            icon: FaGraduationCap,
            color: COLORS.warning,
            subtitle: `${stats?.dataManagement?.interests ?? 0} interests in lib`,
            delay: 0.7
        },
        {
            title: 'Reports',
            value: stats?.reports?.total ?? 0,
            icon: FaFlag,
            color: COLORS.danger,
            subtitle: `${stats?.reports?.pending ?? 0} unresolved cases`,
            delay: 0.8
        },
        {
            title: 'Audit Logs',
            value: stats?.audit?.activityLogs ?? 0,
            icon: FaArrowRotateLeft,
            color: COLORS.primary,
            subtitle: `${stats?.audit?.logsToday ?? 0} logs recorded today`,
            delay: 0.9
        },
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
                        background: 'white',
                        borderRadius: '24px',
                        fontSize: '0.875rem',
                        color: COLORS.primary,
                        fontWeight: '700',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        border: '1px solid rgba(21, 101, 192, 0.1)'
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
                            background: 'white',
                            borderRadius: '32px',
                            padding: '1.8rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '1.2rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                            border: '1px solid rgba(0,0,0,0.02)',
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
                            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>{card.title}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e293b', marginTop: '0.2rem' }}>
                                {card.value}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>{card.subtitle}</div>
                        </div>
                    </motion.div>
                ))}

                {/* Growth Chart (Main) */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 8',
                        background: 'white',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.02)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>Engagement Matrix</h2>
                            <p style={{ margin: '0.3rem 0 0', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Real-time user interaction analysis</p>
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dy={15} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dx={-15} />
                            <Tooltip
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1.2rem' }}
                                cursor={{ stroke: COLORS.primary, strokeWidth: 2, strokeDasharray: '6 6' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke={COLORS.primary}
                                strokeWidth={5}
                                fill="url(#colorEngagement)"
                                dot={{ fill: '#fff', stroke: COLORS.primary, strokeWidth: 3, r: 7 }}
                                activeDot={{ r: 9, strokeWidth: 0, fill: COLORS.secondary }}
                                animationDuration={2500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* System Pulse (Radar) */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 4',
                        background: 'white',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '2.5rem'
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' }}>Network Health</h2>
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart cx="50%" cy="55%" outerRadius="80%" data={[
                            { subject: 'Users', A: stats?.users?.active || 0, fullMark: stats?.users?.total || 100 },
                            { subject: 'Verified', A: stats?.verifications?.approved || 0, fullMark: stats?.users?.total || 100 },
                            { subject: 'Revenue', A: stats?.payments?.revenueThisMonth || 0, fullMark: 10000 },
                            { subject: 'Interests', A: stats?.interests?.accepted || 0, fullMark: stats?.interests?.total || 100 },
                            { subject: 'Stories', A: stats?.successStories?.approved || 0, fullMark: stats?.successStories?.total || 100 },
                        ]}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: '600' }} />
                            <Radar name="System" dataKey="A" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.4} animationDuration={3000} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: COLORS.success, fontWeight: '900', fontSize: '2rem' }}>A+</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>Overall Reliability Score</div>
                    </div>
                </motion.div>

                {/* Verification Breakdown (Bar) */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 7',
                        background: 'white',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.02)'
                    }}
                >
                    <h2 style={{ margin: '0 0 2rem', fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' }}>Data Pipeline</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {stats?.verifications?.distribution.map((item, index) => {
                             const total = stats.verifications.distribution.reduce((a, b) => a + b.count, 0) || 1;
                             const percent = (item.count / total) * 100;
                             const colors = [COLORS.warning, COLORS.success, COLORS.danger];
                             return (
                                 <div key={index}>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem', fontSize: '1rem', fontWeight: '700', color: '#334155' }}>
                                         <span>{item.status}</span>
                                         <span>{item.count}</span>
                                     </div>
                                     <div style={{ height: '16px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                         <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1.5, delay: 0.5 }} style={{ height: '100%', background: colors[index % 3], borderRadius: '8px' }} />
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                </motion.div>

                {/* Donut with Percentage */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        gridColumn: isMobile ? 'span 1' : 'span 5',
                        background: 'white',
                        borderRadius: '40px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 35px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    <h2 style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>Overall Trust</h2>
                    <div style={{ position: 'relative', width: '260px', height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={[
                                        {v: stats?.verifications?.approved || 0}, 
                                        {v: (stats?.verifications?.total || 1) - (stats?.verifications?.approved || 0)}
                                    ]} 
                                    innerRadius={90} 
                                    outerRadius={115} 
                                    paddingAngle={8} 
                                    dataKey="v" 
                                    stroke="none" 
                                    animationDuration={3000}
                                    startAngle={90}
                                    endAngle={450}
                                >
                                    <Cell fill={COLORS.primary} />
                                    <Cell fill="#f4f7fa" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '3.2rem', fontWeight: '900', color: '#1e293b', lineHeight: 1 }}>
                                {Math.round((stats?.verifications?.approved / (stats?.verifications?.total || 1)) * 100)}%
                            </div>
                            <div style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '700', marginTop: '4px' }}>VERIFIED</div>
                        </div>
                    </div>
                </motion.div>

                {/* Secondary Stats Grid */}
                <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {statCards.slice(4, 8).map((card, index) => (
                        <motion.div key={index} variants={itemVariants} initial="hidden" animate="visible" whileHover={{ y: -8, scale: 1.02 }} style={{ background: 'white', borderRadius: '28px', padding: '1.8rem', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', border: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '600' }}>{card.title}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '0.4rem', color: '#1e293b' }}>{card.value}</div>
                            </div>
                            <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: `${card.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                                <card.icon size={24} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Final Row Metrics */}
                <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {statCards.slice(8, 10).map((card, index) => (
                        <motion.div key={index} variants={itemVariants} initial="hidden" animate="visible" style={{ background: 'white', borderRadius: '40px', padding: '2.5rem', boxShadow: '0 15px 40px rgba(0,0,0,0.04)', border: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                                <card.icon size={36} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600' }}>{card.title}</div>
                                <div style={{ fontSize: '2.4rem', fontWeight: '1000', color: '#1e293b', letterSpacing: '-1.5px', lineHeight: 1.1 }}>{card.value}</div>
                                <div style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: '500', marginTop: '0.4rem' }}>{card.subtitle}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}