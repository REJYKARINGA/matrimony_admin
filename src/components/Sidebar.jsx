import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaUserShield, FaFlag, FaHeart, FaMoneyBillWave, FaIdCard, FaChartLine, FaGraduationCap, FaBriefcase, FaHome, FaSlidersH, FaWallet, FaBullhorn, FaBullseye, FaMosque, FaUserTag, FaHistory, FaUnlock, FaLightbulb, FaImage, FaUserCheck } from 'react-icons/fa';
import { Sidebar3DLogo, Sidebar3DBackground } from './Sidebar3DElements';

export default function Sidebar({ collapsed, isMobile, theme, onHoverChange }) {
    const [isHovered, setIsHovered] = useState(false);
    const menuGroups = [
        {
            title: 'Management',
            items: [
                { path: '/dashboard', label: 'Dashboard', icon: <FaChartLine size={20} /> },
                { path: '/users', label: 'Users', icon: <FaUsers size={20} /> },
                { path: '/verifications', label: 'Verifications', icon: <FaUserShield size={20} /> },
                { path: '/photo-verifications', label: 'Photo Verifications', icon: <FaImage size={20} /> },
                { path: '/profile-verifications', label: 'Profile Verifications', icon: <FaUserCheck size={20} /> },
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
                { path: '/suggestions', label: 'User Suggestions', icon: <FaLightbulb size={20} /> },
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
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
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
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
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
            
            {/* INJECTED 3D BACKGROUND */}
            <Sidebar3DBackground />

            <div style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: (!isExpanded && !isMobile) ? '18px' : '2rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1rem',
                transition: 'padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    flexShrink: 0,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    transition: 'margin 0.3s ease'
                }}>
                    <Sidebar3DLogo />
                </div>
                <div style={{
                    overflow: 'hidden',
                    maxWidth: (!isExpanded && !isMobile) ? 0 : '200px',
                    opacity: (!isExpanded && !isMobile) ? 0 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                    <h2 style={{
                        margin: 0,
                        color: 'var(--text)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        whiteSpace: 'nowrap'
                    }}>
                        Matrimony
                    </h2>
                </div>
            </div>

            <nav className="hide-scrollbar" style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuGroups.map((group, groupIndex) => (
                        <div key={group.title} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ 
                                paddingLeft: (!isExpanded && !isMobile) ? '0' : '1.5rem', 
                                marginBottom: '0.75rem', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold', 
                                color: 'var(--text-secondary)', 
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                overflow: 'hidden',
                                maxWidth: (!isExpanded && !isMobile) ? 0 : '200px',
                                opacity: (!isExpanded && !isMobile) ? 0 : 0.6,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: (!isExpanded && !isMobile) ? 0 : 'auto',
                            }}>
                                {group.title}
                            </div>
                            {group.items.map((item) => (
                                <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                                    <NavLink
                                        to={item.path}
                                        style={({ isActive }) => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.875rem 0',
                                            paddingLeft: (!isExpanded && !isMobile) ? '25px' : '1.25rem',
                                            paddingRight: '1.25rem',
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
                                                    marginRight: '1rem', 
                                                    flexShrink: 0,
                                                    display: 'flex',
                                                    color: isActive ? 'var(--primary)' : 'var(--icon-muted)',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {item.icon}
                                                </span>
                                                <div style={{
                                                    overflow: 'hidden',
                                                    maxWidth: (!isExpanded && !isMobile) ? 0 : '180px',
                                                    opacity: (!isExpanded && !isMobile) ? 0 : 1,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}>
                                                    <span style={{ 
                                                        fontWeight: isActive ? 700 : 600, 
                                                        fontSize: '0.9rem',
                                                        letterSpacing: isActive ? '-0.01em' : 'normal',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {item.label}
                                                    </span>
                                                </div>
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
                    <div style={{
                        overflow: 'hidden',
                        maxWidth: (!isExpanded && !isMobile) ? 0 : '150px',
                        opacity: (!isExpanded && !isMobile) ? 0 : 1,
                        whiteSpace: 'nowrap',
                        margin: '0 auto',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            MATRIMONY ADMIN
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            v1.0.4 • End of List
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}
