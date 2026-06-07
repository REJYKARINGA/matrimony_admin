import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LuSettings2, LuSave, LuCheck, LuTriangleAlert } from 'react-icons/lu';
import { FaSpinner } from 'react-icons/fa';

export default function AdminSettings() {
    const [setting, setSetting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        daily_contact_unlock_limit: 10,
        user_contact_permission_unlock: false,
        mandatory_permission_for_unlock: false,
        free_unlock_enabled: false,
        free_unlock_expires_at: '',
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/admin-settings');
            const s = response.data.setting;
            setSetting(s);
            setFormData({
                daily_contact_unlock_limit: s.daily_contact_unlock_limit,
                user_contact_permission_unlock: Boolean(s.user_contact_permission_unlock),
                mandatory_permission_for_unlock: Boolean(s.mandatory_permission_for_unlock),
                free_unlock_enabled: Boolean(s.free_unlock_enabled),
                free_unlock_expires_at: s.free_unlock_expires_at ? s.free_unlock_expires_at.slice(0, 16) : '',
            });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/admin/admin-settings', formData);
            setSetting(response.data.setting);
            showToast('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            showToast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Loading...
            </div>
        );
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                    <LuSettings2 size={22} />
                </div>
                <div>
                    <h2 style={{ margin: 0 }}>Admin Settings</h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Configure global application settings
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                }}>
                    <div style={{
                        background: 'var(--card-bg, #1e1e2e)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border-color, #2d2d3d)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: 'var(--primary)', width: '8px', height: '8px', borderRadius: '50%' }} />
                            <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Daily Contact Unlock Limit</label>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Maximum number of contacts a user can unlock per day
                        </p>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.daily_contact_unlock_limit}
                            onChange={e => setFormData({ ...formData, daily_contact_unlock_limit: parseInt(e.target.value) || 0 })}
                            min="0"
                            style={{ maxWidth: '100%', marginTop: 'auto' }}
                        />
                    </div>

                    <div style={{
                        background: 'var(--card-bg, #1e1e2e)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border-color, #2d2d3d)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',

                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: 'var(--primary)', width: '8px', height: '8px', borderRadius: '50%' }} />
                            <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>User Contact Permission Unlock</label>
                        </div>
                        <label className="form-toggle" style={{ marginTop: '0.25rem' }}>
                            <span className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.user_contact_permission_unlock}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, user_contact_permission_unlock: true, mandatory_permission_for_unlock: false });
                                        } else {
                                            setFormData({ ...formData, user_contact_permission_unlock: false });
                                        }
                                    }}
                                />
                                <span className="slider"></span>
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>
                                {formData.user_contact_permission_unlock ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Allow users to request permission before paying to unlock contacts.
                        </p>
                    </div>

                    <div style={{
                        background: 'var(--card-bg, #1e1e2e)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border-color, #2d2d3d)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: 'var(--primary)', width: '8px', height: '8px', borderRadius: '50%' }} />
                            <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Mandatory Permission for Unlock</label>
                        </div>
                        <label className="form-toggle" style={{ marginTop: '0.25rem' }}>
                            <span className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.mandatory_permission_for_unlock}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, mandatory_permission_for_unlock: true, user_contact_permission_unlock: false });
                                        } else {
                                            setFormData({ ...formData, mandatory_permission_for_unlock: false });
                                        }
                                    }}
                                />
                                <span className="slider"></span>
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>
                                {formData.mandatory_permission_for_unlock ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Users must have an approved permission request before unlocking via Wallet or Pay Now.
                        </p>
                    </div>

                    <div style={{
                        background: 'var(--card-bg, #1e1e2e)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid var(--border-color, #2d2d3d)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ background: '#FF6B35', width: '8px', height: '8px', borderRadius: '50%' }} />
                            <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Free Unlock Offer</label>
                        </div>
                        <label className="form-toggle" style={{ marginTop: '0.25rem' }}>
                            <span className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.free_unlock_enabled}
                                    onChange={e => setFormData({ ...formData, free_unlock_enabled: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>
                                {formData.free_unlock_enabled ? 'Free' : 'Paid'}
                            </span>
                        </label>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Users can unlock contacts for free (₹0). Useful for promotions or trial periods.
                        </p>
                        {formData.free_unlock_enabled && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '0.35rem' }}>Expiry (optional)</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={formData.free_unlock_expires_at}
                                    onChange={e => setFormData({ ...formData, free_unlock_expires_at: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ borderRadius: '12px', padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {saving ? <FaSpinner className="spinner" /> : <LuSave size={18} />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>

            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000000,
                    padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem',
                    background: toast.type === 'error' ? '#EF4444' : '#10B981', color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'modalSlideUp 0.3s ease-out',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {toast.type === 'error' ? <LuTriangleAlert size={18} /> : <LuCheck size={18} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
