import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Close sidebar on route change in mobile
    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }
    }, [location, isMobile]);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', transition: 'background-color 0.3s' }}>
            {/* Mobile Backdrop */}
            {isMobile && !collapsed && (
                <div
                    onClick={() => setCollapsed(true)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 15
                    }}
                />
            )}

            <Sidebar collapsed={collapsed} isMobile={isMobile} theme={theme} />

            <div style={{
                flex: 1,
                marginLeft: isMobile ? 0 : (collapsed ? '80px' : '250px'),
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s ease'
            }}>
                <Header
                    toggleSidebar={toggleSidebar}
                    collapsed={collapsed}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                <main style={{ padding: isMobile ? '1rem' : '2rem', flex: 1, overflowX: 'hidden' }}>
                    <Outlet context={{ theme }} />
                </main>
            </div>
        </div>
    );
}
