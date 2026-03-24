import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaUserShield, FaFlag, FaHeart, FaMoneyBillWave, FaIdCard, FaChartLine, FaGraduationCap, FaBriefcase, FaHome, FaSlidersH, FaWallet, FaBullhorn, FaBullseye, FaMosque, FaUserTag, FaHistory, FaUnlock } from 'react-icons/fa';

export default function Sidebar({ collapsed, isMobile, theme, onHoverChange }) {
    const [isHovered, setIsHovered] = useState(false);
    const menuGroups = [
        {
            title: 'Management',
            items: [
                { path: '/dashboard', label: 'Dashboard', icon: <FaChartLine size={20} /> },
                { path: '/users', label: 'Users', icon: <FaUsers size={20} /> },
                { path: '/verifications', label: 'Verifications', icon: <FaUserShield size={20} /> },
                { path: '/reports', label: 'Reports', icon: <FaFlag size={20} /> },
                { path: '/user-profiles', label: 'User Profiles', icon: <FaIdCard size={20} /> },
            ]
        },
        {
            title: 'Financial',
            items: [
                { path: '/payments', label: 'Payments', icon: <FaMoneyBillWave size={20} /> },
                { path: '/wallet-transactions', label: 'Wallet Transactions', icon: <FaWallet size={20} /> },
            ]
        },
        {
            title: 'App Content',
            items: [
                { path: '/success-stories', label: 'Success Stories', icon: <FaHeart size={20} /> },
                { path: '/engagement-posters', label: 'Engagement Posters', icon: <FaHeart size={20} /> },
            ]
        },
        {
            title: 'Data Management',
            items: [
                { path: '/education', label: 'Education', icon: <FaGraduationCap size={20} /> },
                { path: '/occupation', label: 'Occupation', icon: <FaBriefcase size={20} /> },
                { path: '/interests', label: 'Interests & Hobbies', icon: <FaHeart size={20} /> },
                { path: '/personalities', label: 'Personality Traits', icon: <FaUserTag size={20} /> },
                { path: '/religion-management', label: 'Religion & Community', icon: <FaMosque size={20} /> },
                { path: '/family-details', label: 'Family Details', icon: <FaHome size={20} /> },
            ]
        },
        {
            title: 'Settings & Logs',
            items: [
                { path: '/promotion-settings', label: 'Promotion Settings', icon: <FaBullhorn size={20} /> },
                { path: '/mediator-promotions', label: 'Mediator Promotions', icon: <FaBullseye size={20} /> },
                { path: '/contact-unlocks', label: 'Contact Unlocks', icon: <FaUnlock size={20} /> },
                { path: '/preferences', label: 'Preferences', icon: <FaSlidersH size={20} /> },
                { path: '/audit-logs', label: 'Login & Activity Logs', icon: <FaHistory size={20} /> },
            ]
        }
    ];

    const sidebarWidth = isMobile ? '250px' : (collapsed && !isHovered ? '80px' : '250px');
    const transform = isMobile ? (collapsed ? 'translateX(-100%)' : 'translateX(0)') : 'none';
    const isExpanded = !isMobile && (isHovered || !collapsed);
    return (
        <div style={{
            width: sidebarWidth,
            height: isMobile ? '100vh' : 'calc(100vh - 2rem)',
            margin: isMobile ? 0 : '1rem 0 1rem 1rem',
            background: 'var(--sidebar-bg)',
            borderRadius: isMobile ? 0 : '24px',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
            transition: 'all 0.3s ease',
            zIndex: 20,
            transform: transform,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
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
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (!isExpanded && !isMobile) ? 'center' : 'flex-start',
                padding: (!isExpanded && !isMobile) ? '0' : '0 2rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1rem'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--primary)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: (!isExpanded && !isMobile) ? 0 : '12px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)'
                }}>
                    M
                </div>
                {(isExpanded || isMobile) && (
                    <h2 style={{
                        margin: 0,
                        color: 'var(--text)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em'
                    }}>
                        Matrimony
                    </h2>
                )}
            </div>

            <nav className="hide-scrollbar" style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuGroups.map((group, groupIndex) => (
                        <div key={group.title} style={{ marginBottom: '1.5rem' }}>
                            {isExpanded && (
                                <div style={{ 
                                    paddingLeft: '1.5rem', 
                                    marginBottom: '0.75rem', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold', 
                                    color: 'var(--text-secondary)', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    opacity: 0.6
                                }}>
                                    {group.title}
                                </div>
                            )}
                            {group.items.map((item) => (
                                <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                                    <NavLink
                                        to={item.path}
                                        style={({ isActive }) => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: (!isExpanded && !isMobile) ? 'center' : 'flex-start',
                                            padding: '0.875rem 1.25rem',
                                            margin: '0 0.75rem',
                                            textDecoration: 'none',
                                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                            background: isActive ? '#FFFFFF' : 'transparent',
                                            borderRadius: '12px',
                                            boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            zIndex: isActive ? 2 : 1
                                        })}
                                        onMouseEnter={(e) => {
                                            const isActive = e.currentTarget.classList.contains('active');
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'var(--hover-bg)';
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            const isActive = e.currentTarget.classList.contains('active');
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }
                                        }}
                                        title={(!isExpanded && !isMobile) ? item.label : ''}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span style={{ 
                                                    marginRight: (!isExpanded && !isMobile) ? 0 : '1rem', 
                                                    display: 'flex',
                                                    color: isActive ? 'var(--primary)' : 'var(--icon-muted)',
                                                    transition: 'all 0.3s'
                                                }}>
                                                    {item.icon}
                                                </span>
                                                {(isExpanded || isMobile) && (
                                                    <span style={{ 
                                                        fontWeight: isActive ? 700 : 600, 
                                                        fontSize: '0.9rem',
                                                        letterSpacing: isActive ? '-0.01em' : 'normal'
                                                    }}>
                                                        {item.label}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </div>
                    ))}
                </ul>

                {/* BOTTOM INDICATOR - SHOW END OF LIST */}
                <div style={{ 
                    padding: '2rem 0',
                    textAlign: 'center',
                    opacity: 0.4
                }}>
                    {(isExpanded || isMobile) ? (
                        <>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                MATRIMONY ADMIN
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                v1.0.4 • End of List
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            END
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
}
