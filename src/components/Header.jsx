import { FaBars, FaSignOutAlt, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';

export default function Header({ toggleSidebar, collapsed, theme, toggleTheme, isMobile }) {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        window.location.href = '/';
    };

    return (
        <header style={{
            height: '72px',
            background: 'var(--header-bg)',
            borderRadius: isMobile ? 0 : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 1rem' : '0 1.5rem',
            position: 'sticky',
            top: isMobile ? 0 : '1rem',
            margin: isMobile ? 0 : '1rem 1rem 0 1rem',
            zIndex: 10,
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <FaBars />
                </button>
                <h2 style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.25rem', color: 'var(--text)' }}>Dashboard</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem' }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme === 'dark' ? '#FCD34D' : 'var(--icon-muted)',
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaUserCircle size={24} color={theme === 'dark' ? '#94A3B8' : 'var(--icon-muted)'} />
                    {!isMobile && (
                        <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                            {user.user_profile?.first_name || 'Admin'}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 500
                    }}
                    title="Logout"
                >
                    <FaSignOutAlt />
                    {!isMobile && 'Logout'}
                </button>
            </div>
        </header>
    );
}
