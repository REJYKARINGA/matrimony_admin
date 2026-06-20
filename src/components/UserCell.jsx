import UserAvatar from './UserAvatar';

const badgeStyle = {
    padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem',
    fontWeight: '600', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
};

export default function UserCell({ user, profile, showBadge = true, avatarSize = 36 }) {
    const name = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '—'
        : user?.name || '—';
    const mid = user?.matrimony_id || profile?.user?.matrimony_id || '';
    const isVerified = profile?.is_identity_verified || user?.userProfile?.is_identity_verified;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserAvatar user={user || profile} profile={profile} size={avatarSize} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <div style={{ fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {name}
                    {showBadge && isVerified && (
                        <span style={{ ...badgeStyle, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                            ✓ Verified
                        </span>
                    )}
                </div>
                {mid && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{mid}</span>}
            </div>
        </div>
    );
}
