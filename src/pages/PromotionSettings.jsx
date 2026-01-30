import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaEdit, FaTrash, FaCheck, FaPlus, FaBullhorn } from 'react-icons/fa';
import FormModal from '../components/FormModal';

export default function PromotionSettings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        views_required: '',
        likes_required: '0',
        comments_required: '0',
        payout_amount: '',
        is_likes_enabled: false,
        is_comments_enabled: false,
        payout_period_days: '7',
        is_default: false,
        is_active: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/promotion-settings');
            setSettings(response.data.settings);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/admin/promotion-settings/${editingId}`, formData);
            } else {
                await api.post('/admin/promotion-settings', formData);
            }
            fetchSettings();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save setting:', error);
            alert('Failed to save setting');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this setting?')) return;
        try {
            await api.delete(`/admin/promotion-settings/${id}`);
            fetchSettings();
        } catch (error) {
            console.error('Failed to delete setting:', error);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await api.put(`/admin/promotion-settings/${id}/set-default`);
            fetchSettings();
        } catch (error) {
            console.error('Failed to set default:', error);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            views_required: '',
            likes_required: '0',
            comments_required: '0',
            payout_amount: '',
            is_likes_enabled: false,
            is_comments_enabled: false,
            payout_period_days: '7',
            is_default: false,
            is_active: true
        });
    };

    const openEditModal = (setting) => {
        setEditingId(setting.id);
        const { created_at, updated_at, ...data } = setting;
        // Ensure boolean conversion if API returns 1/0
        setFormData({
            ...data,
            is_likes_enabled: Boolean(data.is_likes_enabled),
            is_comments_enabled: Boolean(data.is_comments_enabled),
            is_default: Boolean(data.is_default),
            is_active: Boolean(data.is_active)
        });
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, color: 'var(--text)' }}>Promotion Settings</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FaPlus /> Add New Setting
                </button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Views Required</th>
                                <th>Likes / Comments</th>
                                <th>Payout</th>
                                <th>Period</th>
                                <th>Status</th>
                                <th>Default</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settings.map((setting) => (
                                <tr key={setting.id}>
                                    <td>{Number(setting.views_required).toLocaleString()}</td>
                                    <td>
                                        <div>Likes: {setting.is_likes_enabled ? Number(setting.likes_required).toLocaleString() : '-'}</div>
                                        <div>Comments: {setting.is_comments_enabled ? Number(setting.comments_required).toLocaleString() : '-'}</div>
                                    </td>
                                    <td>₹{Number(setting.payout_amount).toLocaleString()}</td>
                                    <td>{setting.payout_period_days} days</td>
                                    <td>
                                        <span className={`status-badge ${setting.is_active ? 'status-active' : 'status-blocked'}`}>
                                            {setting.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        {setting.is_default ? (
                                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaCheck /> Default
                                            </span>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                                onClick={() => handleSetDefault(setting.id)}
                                            >
                                                Make Default
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="icon-btn edit"
                                                onClick={() => openEditModal(setting)}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => handleDelete(setting.id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingId ? 'Edit Setting' : 'New Promotion Setting'}
                    onSubmit={handleSubmit}
                    isLoading={submitting}
                >
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Views Required (per payout unit)</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.views_required}
                            onChange={e => setFormData({ ...formData, views_required: e.target.value })}
                            required
                            min="1"
                        />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_likes_enabled}
                                    onChange={e => setFormData({ ...formData, is_likes_enabled: e.target.checked })}
                                /> Enable Likes Requirement
                            </label>
                            {formData.is_likes_enabled && (
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.likes_required}
                                    onChange={e => setFormData({ ...formData, likes_required: e.target.value })}
                                    min="0"
                                    style={{ marginTop: '0.5rem' }}
                                />
                            )}
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_comments_enabled}
                                    onChange={e => setFormData({ ...formData, is_comments_enabled: e.target.checked })}
                                /> Enable Comments Requirement
                            </label>
                            {formData.is_comments_enabled && (
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.comments_required}
                                    onChange={e => setFormData({ ...formData, comments_required: e.target.value })}
                                    min="0"
                                    style={{ marginTop: '0.5rem' }}
                                />
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Payout Amount (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.payout_amount}
                                onChange={e => setFormData({ ...formData, payout_amount: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Payout Period (Days)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.payout_period_days}
                                onChange={e => setFormData({ ...formData, payout_period_days: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            /> Active Status
                        </label>
                        <label style={{ display: 'block' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_default}
                                onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                            /> Set as Default
                        </label>
                    </div>
                </FormModal>
            )}
        </div>
    );
}
