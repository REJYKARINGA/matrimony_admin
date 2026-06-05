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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px' }}>
                    <div className="form-group">
                        <label>Daily Contact Unlock Limit</label>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Maximum number of contacts a user can unlock per day
                        </p>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.daily_contact_unlock_limit}
                            onChange={e => setFormData({ ...formData, daily_contact_unlock_limit: parseInt(e.target.value) || 0 })}
                            min="0"
                            style={{ maxWidth: '200px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-toggle">
                            <span className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.user_contact_permission_unlock}
                                    onChange={e => setFormData({ ...formData, user_contact_permission_unlock: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </span>
                            <span>User Contact Permission Unlock</span>
                        </label>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Allow users to request permission before paying to unlock contacts. When enabled, users can ask for mutual interest before spending wallet money.
                        </p>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
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
