import { NavLink } from 'react-router-dom';
import { FaUsers, FaUserShield, FaFlag, FaHeart, FaMoneyBillWave, FaIdCard } from 'react-icons/fa';

export default function Sidebar({ collapsed, isMobile, theme }) {
    const menuItems = [
        { path: '/dashboard', label: 'Verifications', icon: <FaUserShield size={20} /> },
        { path: '/users', label: 'Users', icon: <FaUsers size={20} /> },
        { path: '/user-profiles', label: 'User Profiles', icon: <FaIdCard size={20} /> },
        { path: '/reports', label: 'Reports', icon: <FaFlag size={20} /> },
        { path: '/success-stories', label: 'Success Stories', icon: <FaHeart size={20} /> },
        { path: '/payments', label: 'Payments', icon: <FaMoneyBillWave size={20} /> },
    ];

    const sidebarWidth = isMobile ? '250px' : (collapsed ? '80px' : '250px');
    const transform = isMobile ? (collapsed ? 'translateX(-100%)' : 'translateX(0)') : 'none';

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
        }}>
            <div style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                padding: (collapsed && !isMobile) ? '0' : '0 2rem',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <h2 style={{
                    margin: 0,
                    color: 'var(--primary)',
                    fontSize: '1.5rem'
                }}>
                    {(collapsed && !isMobile) ? 'M' : 'Matrimony'}
                </h2>
            </div>

            <nav style={{ flex: 1, padding: '1rem 0' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                            <NavLink
                                to={item.path}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                                    padding: '0.75rem 1rem',
                                    textDecoration: 'none',
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    background: isActive ? (theme === 'dark' ? 'rgba(180, 127, 255, 0.2)' : '#F3E8FF') : 'transparent',
                                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                                    transition: 'all 0.2s'
                                })}
                                title={(collapsed && !isMobile) ? item.label : ''}
                            >
                                <span style={{ marginRight: (collapsed && !isMobile) ? 0 : '1rem', display: 'flex' }}>
                                    {item.icon}
                                </span>
                                {(!collapsed || isMobile) && <span style={{ fontWeight: 500 }}>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
