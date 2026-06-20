import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LuMenu, LuLogOut, LuUser, LuMoon, LuSun, LuSearch, LuArrowRight, LuCommand } from 'react-icons/lu';
import { CONFIG } from '../config';
import api from '../api/axios';

const quickNavItems = [
    { path: '/dashboard', label: 'Dashboard', group: 'Management' },
    { path: '/users', label: 'Users', group: 'Management' },
    { path: '/user-profiles', label: 'User Profiles', group: 'Management' },
    { path: '/photo-requests', label: 'Photo Access Monitoring', group: 'Safety & Security' },
    { path: '/verifications', label: 'ID Verifications', group: 'Safety & Security' },
    { path: '/photo-verifications', label: 'Photo Verifications', group: 'Safety & Security' },
    { path: '/profile-verifications', label: 'Profile Modifications', group: 'Safety & Security' },
    { path: '/reports', label: 'User Reports & Flags', group: 'Safety & Security' },
    { path: '/payments', label: 'Payments', group: 'Financial' },
    { path: '/wallet-transactions', label: 'Wallet Transactions', group: 'Financial' },
    { path: '/recharge-tiers', label: 'Recharge Tiers', group: 'Financial' },
    { path: '/success-stories', label: 'Success Stories', group: 'App Content' },
    { path: '/engagement-posters', label: 'Engagement Posters', group: 'App Content' },
    { path: '/suggestions', label: 'User Suggestions', group: 'App Content' },
    { path: '/education', label: 'Education', group: 'Data Management' },
    { path: '/occupation', label: 'Occupation', group: 'Data Management' },
    { path: '/interests', label: 'Interests & Hobbies', group: 'Data Management' },
    { path: '/personalities', label: 'Personality Traits', group: 'Data Management' },
    { path: '/religion-management', label: 'Religion & Community', group: 'Data Management' },
    { path: '/family-details', label: 'Family Details', group: 'Data Management' },
    { path: '/promotion-settings', label: 'Promotion Settings', group: 'Settings & Logs' },
    { path: '/mediator-promotions', label: 'Mediator Promotions', group: 'Settings & Logs' },
    { path: '/admin-settings', label: 'Admin Settings', group: 'Settings & Logs' },
    { path: '/festivals', label: 'Festival Offers', group: 'Settings & Logs' },
    { path: '/contact-unlock-requests', label: 'Unlock Requests', group: 'Settings & Logs' },
    { path: '/contact-unlocks', label: 'Contact Unlocks', group: 'Settings & Logs' },
    { path: '/preferences', label: 'Preferences', group: 'Settings & Logs' },
    { path: '/audit-logs', label: 'Login & Activity Logs', group: 'Settings & Logs' },
];

export default function Header({ toggleSidebar, collapsed, theme, toggleTheme, isMobile }) {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const profileRef = useRef(null);
    const photoInputRef = useRef(null);
    const [focused, setFocused] = useState(false);
    const [highlightedIdx, setHighlightedIdx] = useState(-1);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const filteredItems = searchQuery.trim()
        ? quickNavItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.path.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : quickNavItems;

    const handleSelect = useCallback((path) => {
        setSearchQuery('');
        setShowDropdown(false);
        setHighlightedIdx(-1);
        inputRef.current?.blur();
        navigate(path);
    }, [navigate]);

    const currentLabel = quickNavItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

    const openDropdown = useCallback(() => {
        setShowDropdown(true);
        setHighlightedIdx(-1);
    }, []);

    const closeDropdown = useCallback(() => {
        setShowDropdown(false);
        setHighlightedIdx(-1);
        setFocused(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                closeDropdown();
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeDropdown]);

    useEffect(() => {
        closeDropdown();
        setSearchQuery('');
    }, [location.pathname, closeDropdown]);

    useEffect(() => {
        if (showDropdown && listRef.current && highlightedIdx >= 0) {
            const el = listRef.current.children[highlightedIdx];
            if (el) el.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIdx, showDropdown]);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const handleKeyDown = (e) => {
        if (!showDropdown) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                openDropdown();
                return;
            }
        }

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (filteredItems.length > 0) {
                    const idx = highlightedIdx >= 0 ? highlightedIdx : 0;
                    handleSelect(filteredItems[idx].path);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (filteredItems.length > 0) {
                    setHighlightedIdx(prev =>
                        prev < filteredItems.length - 1 ? prev + 1 : prev
                    );
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIdx(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Escape':
                e.preventDefault();
                closeDropdown();
                inputRef.current?.blur();
                break;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        window.location.href = '/';
    };

    const inputWidth = isMobile ? (focused ? '180px' : '100px') : (focused ? '320px' : '200px');

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
            margin: isMobile ? 0 : '1rem 1.5rem 0 1.5rem',
            zIndex: 10,
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem', flex: 1, minWidth: 0 }}>
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
                        alignItems: 'center',
                        flexShrink: 0
                    }}
                >
                    <LuMenu />
                </button>
                {!isMobile && (
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text)', whiteSpace: 'nowrap', flexShrink: 0 }}>{currentLabel}</h2>
                )}

                {/* Quick Nav Search */}
                <div ref={searchRef} style={{ position: 'relative', flex: isMobile ? 1 : '0 1 auto', maxWidth: focused ? '400px' : '320px', minWidth: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: focused ? 'var(--card-bg)' : 'var(--bg)',
                        borderRadius: '12px',
                        border: focused
                            ? '2px solid var(--primary)'
                            : '1px solid var(--border-color)',
                        padding: '0.4rem 0.85rem',
                        gap: '0.6rem',
                        width: inputWidth,
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'text',
                        boxShadow: focused
                            ? '0 0 0 4px rgba(var(--primary-rgb, 99, 102, 241), 0.12), var(--shadow-sm)'
                            : 'var(--shadow-sm)',
                    }}
                        onClick={() => inputRef.current?.focus()}
                    >
                        <LuSearch size={16} color={focused ? 'var(--primary)' : 'var(--text-secondary)'} style={{ flexShrink: 0, transition: 'color 0.3s' }} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search pages..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setHighlightedIdx(-1);
                                openDropdown();
                            }}
                            onFocus={() => { setFocused(true); openDropdown(); }}
                            onBlur={() => setFocused(false)}
                            onKeyDown={handleKeyDown}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                color: 'var(--text)',
                                fontSize: '0.875rem',
                                width: '100%',
                                fontFamily: 'inherit',
                                letterSpacing: '0.01em'
                            }}
                        />
                        {!focused && !searchQuery && !isMobile && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                background: 'var(--border-color)',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                flexShrink: 0,
                                opacity: 0.7
                            }}>
                                <LuCommand size={10} />
                                <span>K</span>
                            </div>
                        )}
                    </div>

                    {showDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            minWidth: '280px',
                            background: 'var(--card-bg)',
                            borderRadius: '14px',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.08)',
                            border: '1px solid var(--border-color)',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 9999,
                            padding: '0.4rem',
                            animation: 'modalSlideUp 0.2s ease-out'
                        }}>
                            {filteredItems.length === 0 ? (
                                <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                                    <LuSearch size={24} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '0.5rem' }} />
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No pages found</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>Try a different search term</div>
                                </div>
                            ) : (
                                <div ref={listRef}>
                                    {filteredItems.map((item, index) => {
                                        const isActive = location.pathname === item.path;
                                        const isHighlighted = highlightedIdx === index;
                                        return (
                                            <div
                                                key={item.path}
                                                onClick={() => handleSelect(item.path)}
                                                onMouseEnter={() => setHighlightedIdx(index)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.65rem 0.85rem',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    background: isActive
                                                        ? 'var(--primary)'
                                                        : isHighlighted
                                                            ? 'var(--hover-bg)'
                                                            : 'transparent',
                                                    color: isActive ? '#fff' : 'var(--text)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActive ? 600 : 400,
                                                    transition: 'all 0.15s ease',
                                                    transform: isHighlighted && !isActive ? 'translateX(3px)' : 'none',
                                                    marginBottom: '2px'
                                                }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span>{item.label}</span>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                                                        fontWeight: 500
                                                    }}>
                                                        {item.group}
                                                    </span>
                                                </div>
                                                <LuArrowRight size={14} style={{ opacity: isActive || isHighlighted ? 0.8 : 0.3, transition: 'opacity 0.2s' }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div style={{
                                marginTop: '0.3rem',
                                padding: '0.5rem 0.75rem 0.25rem',
                                borderTop: '1px solid var(--border-color)',
                                display: 'flex',
                                gap: '1rem',
                                fontSize: '0.65rem',
                                color: 'var(--text-secondary)',
                                opacity: 0.5
                            }}>
                                <span>↑↓ Navigate</span>
                                <span>↵ Select</span>
                                <span>Esc Close</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1.25rem', flexShrink: 0 }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme === 'dark' ? 'var(--secondary)' : 'var(--icon-muted)',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <LuSun /> : <LuMoon />}
                </button>

                <div ref={profileRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div onClick={() => setShowProfileMenu(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '10px', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: user.user_profile?.profile_picture ? 'transparent' : 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                        }}>
                            {user.user_profile?.profile_picture ? (
                                <img src={`${CONFIG.BASE_URL}/storage/${user.user_profile.profile_picture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <LuUser size={16} color="#fff" />
                            )}
                        </div>
                        {!isMobile && (
                            <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>
                                {user.user_profile?.first_name || 'Admin'}
                            </span>
                        )}
                    </div>

                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000,
                            background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)', minWidth: '260px', overflow: 'hidden',
                        }}>
                            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0, overflow: 'hidden',
                                    background: user.user_profile?.profile_picture ? 'transparent' : 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {user.user_profile?.profile_picture ? (
                                        <img src={`${CONFIG.BASE_URL}/storage/${user.user_profile.profile_picture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <LuUser size={20} color="#fff" />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>
                                        {user.user_profile?.first_name} {user.user_profile?.last_name || ''}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 500, minWidth: 36 }}>Email</span>
                                    <span style={{ color: 'var(--text)', wordBreak: 'break-all' }}>{user.email}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 500, minWidth: 36 }}>Phone</span>
                                    <span style={{ color: 'var(--text)' }}>{user.phone || '-'}</span>
                                </div>
                                <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto} style={{
                                    marginTop: 6, padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border-color)',
                                    background: 'transparent', cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                                    color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: 6, opacity: uploadingPhoto ? 0.6 : 1,
                                }}>
                                    <LuUser size={14} />
                                    {uploadingPhoto ? 'Uploading...' : 'Update Photo'}
                                </button>
                            </div>
                            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingPhoto(true);
                                try {
                                    const fd = new FormData();
                                    fd.append('profile_picture', file);
                                    const res = await api.post('/auth/update-profile-picture', fd, {
                                        headers: { 'Content-Type': 'multipart/form-data' },
                                    });
                                    const newUser = res.data.user;
                                    localStorage.setItem('admin_user', JSON.stringify(newUser));
                                    window.location.reload();
                                } catch {
                                    setUploadingPhoto(false);
                                }
                            }} />
                        </div>
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
                        gap: '0.4rem',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    title="Logout"
                >
                    <LuLogOut />
                    {!isMobile && 'Logout'}
                </button>
            </div>
        </header>
    );
}
