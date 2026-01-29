import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaUserCheck, FaUserShield, FaHeart, FaMoneyBillWave, FaFlag, FaChartLine } from 'react-icons/fa';

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

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading dashboard...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Failed to load dashboard data</div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: stats.users.total, icon: FaUsers, color: COLORS.primary, subtitle: `${stats.users.active} active` },
        { title: 'Verifications', value: stats.verifications.pending, icon: FaUserShield, color: COLORS.warning, subtitle: 'pending' },
        { title: 'Total Profiles', value: stats.profiles.total, icon: FaUserCheck, color: COLORS.info, subtitle: `${stats.profiles.verified} verified` },
        { title: 'Active Matches', value: stats.matches.total, icon: FaHeart, color: COLORS.danger, subtitle: `${stats.matches.accepted} accepted` },
        { title: 'Total Revenue', value: `₹${stats.payments.totalRevenue.toLocaleString()}`, icon: FaMoneyBillWave, color: COLORS.success, subtitle: `₹${stats.payments.revenueThisMonth.toLocaleString()} this month` },
        { title: 'Reports', value: stats.reports.total, icon: FaFlag, color: COLORS.danger, subtitle: `${stats.reports.pending} pending` },
    ];

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FaChartLine size={32} color={COLORS.primary} />
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Dashboard</h1>
            </div>

            {/* Stat Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {statCards.map((card, index) => (
                    <div key={index} style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        boxShadow: '0 2px 8px var(--shadow-color)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px var(--shadow-color)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-color)';
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{card.title}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{card.value}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{card.subtitle}</div>
                            </div>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: `${card.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <card.icon size={28} color={card.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>

                {/* User Growth Chart */}
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>User Growth (Last 12 Months)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.users.growth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} name="Users" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Growth Chart */}
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Revenue Growth (Last 12 Months)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.payments.revenueGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="amount" fill={COLORS.success} name="Revenue (₹)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gender Distribution */}
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Gender Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.profiles.genderDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ gender, count, percent }) => `${gender}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {stats.profiles.genderDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.info : COLORS.danger} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Verification Status */}
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Verification Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.verifications.distribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {stats.verifications.distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={[COLORS.warning, COLORS.success, COLORS.danger][index]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Match Status */}
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Match Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.matches.distribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="status" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill={COLORS.primary} name="Matches" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Additional Stats Summary */}
                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px var(--shadow-color)',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>System Overview</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <StatRow label="Total Interests" value={stats.interests.total} sublabel={`${stats.interests.accepted} accepted, ${stats.interests.pending} pending`} />
                        <StatRow label="Success Stories" value={stats.successStories.total} sublabel={`${stats.successStories.approved} approved, ${stats.successStories.pending} pending`} />
                        <StatRow label="User Reports" value={stats.reports.total} sublabel={`${stats.reports.resolved} resolved, ${stats.reports.pending} pending`} />
                        <StatRow label="Total Payments" value={stats.payments.total} sublabel={`₹${stats.payments.totalRevenue.toLocaleString()} total revenue`} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value, sublabel }) {
    return (
        <div style={{
            padding: '1rem',
            background: 'var(--bg)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sublabel}</div>
        </div>
    );
}
