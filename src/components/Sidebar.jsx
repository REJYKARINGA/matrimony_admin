import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaUserShield, FaFlag, FaHeart, FaMoneyBillWave, FaIdCard, FaChartLine, FaGraduationCap, FaBriefcase, FaHome, FaSlidersH, FaWallet, FaBullhorn, FaBullseye, FaMosque } from 'react-icons/fa';

export default function Sidebar({ collapsed, isMobile, theme, onHoverChange }) {
    const [isHovered, setIsHovered] = useState(false);
    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FaChartLine size={20} /> },
        { path: '/verifications', label: 'Verifications', icon: <FaUserShield size={20} /> },
        { path: '/users', label: 'Users', icon: <FaUsers size={20} /> },
        { path: '/user-profiles', label: 'User Profiles', icon: <FaIdCard size={20} /> },
        { path: '/reports', label: 'Reports', icon: <FaFlag size={20} /> },
        { path: '/success-stories', label: 'Success Stories', icon: <FaHeart size={20} /> },
        { path: '/payments', label: 'Payments', icon: <FaMoneyBillWave size={20} /> },
        { path: '/wallet-transactions', label: 'Wallet Transactions', icon: <FaWallet size={20} /> },
        { path: '/education', label: 'Education', icon: <FaGraduationCap size={20} /> },
        { path: '/occupation', label: 'Occupation', icon: <FaBriefcase size={20} /> },
        { path: '/religion-management', label: 'Religion & Community', icon: <FaMosque size={20} /> },
        { path: '/family-details', label: 'Family Details', icon: <FaHome size={20} /> },
        { path: '/preferences', label: 'Preferences', icon: <FaSlidersH size={20} /> },
        { path: '/promotion-settings', label: 'Promotion Settings', icon: <FaBullhorn size={20} /> },
        { path: '/mediator-promotions', label: 'Mediator Promotions', icon: <FaBullseye size={20} /> },
    ];

    const sidebarWidth = isMobile ? '250px' : (collapsed && !isHovered ? '80px' : '250px');
    const transform = isMobile ? (collapsed ? 'translateX(-100%)' : 'translateX(0)') : 'none';
    const isExpanded = !isMobile && (isHovered || !collapsed);
    return (
        <div style={{
            width: sidebarWidth,
            height: '100vh',
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            transition: 'all 0.3s ease',
            zIndex: 20,
            transform: transform,
            boxShadow: isMobile && !collapsed ? '4px 0 10px var(--shadow-color)' : 'none'
        }}
            onMouseEnter={() => {
                if (collapsed && !isMobile) {
                    setIsHovered(true);
                    onHoverChange?.(true);
                }
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                onHoverChange?.(false);
            }}>
            <div style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (!isExpanded && !isMobile) ? 'center' : 'flex-start',
                padding: (!isExpanded && !isMobile) ? '0' : '0 2rem',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <h2 style={{
                    margin: 0,
                    color: 'var(--primary)',
                    fontSize: '1.5rem'
                }}>
                    {(!isExpanded && !isMobile) ? 'M' : 'Matrimony'}
                </h2>
            </div>

            <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                            <NavLink
                                to={item.path}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: (!isExpanded && !isMobile) ? 'center' : 'flex-start',
                                    padding: '0.75rem 1rem',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    background: isActive ? (theme === 'dark' ? 'rgba(180, 127, 255, 0.2)' : '#F3E8FF') : 'transparent',
                                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                                    transition: 'all 0.2s'
                                })}
                                onMouseEnter={(e) => {
                                    const isActive = e.currentTarget.classList.contains('active');
                                    if (!isActive) {
                                        e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    const isActive = e.currentTarget.classList.contains('active');
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                                title={(!isExpanded && !isMobile) ? item.label : ''}
                            >
                                <span style={{ marginRight: (!isExpanded && !isMobile) ? 0 : '1rem', display: 'flex' }}>
                                    {item.icon}
                                </span>
                                {(isExpanded || isMobile) && <span style={{ fontWeight: 500 }}>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
