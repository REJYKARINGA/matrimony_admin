import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaCheck, FaPlus } from 'react-icons/fa';
import { LuPencil, LuTrash2, LuSparkles, LuCircleCheck, LuSettings2 } from 'react-icons/lu';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';

export default function PromotionSettings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
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

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/promotion-settings/${deleteId}`);
            fetchSettings();
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete setting:', error);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
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
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                        <LuSettings2 size={22} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Promotion Tiers</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage reward criteria and payouts</p>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    style={{ borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                >
                    <LuSparkles /> Add New Tier
                </button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Views Required</th>
                                <th>Criteria Details</th>
                                <th>Payout Amount</th>
                                <th>Vality Period</th>
                                <th>Status</th>
                                <th>Default</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settings.map((setting) => (
                                <tr key={setting.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                        {Number(setting.views_required).toLocaleString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <LuCircleCheck size={14} color={setting.is_likes_enabled ? 'var(--success)' : 'var(--text-secondary)'} />
                                                Likes: {setting.is_likes_enabled ? Number(setting.likes_required).toLocaleString() : 'N/A'}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <LuCircleCheck size={14} color={setting.is_comments_enabled ? 'var(--success)' : 'var(--text-secondary)'} />
                                                Comments: {setting.is_comments_enabled ? Number(setting.comments_required).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                                        ₹{Number(setting.payout_amount).toLocaleString()}
                                    </td>
                                    <td>{setting.payout_period_days} days</td>
                                    <td>
                                        <span className={`badge ${setting.is_active ? 'badge-verified' : 'badge-rejected'}`}>
                                            {setting.is_active ? 'Active' : 'Stopped'}
                                        </span>
                                    </td>
                                    <td>
                                        {setting.is_default ? (
                                            <span style={{
                                                color: 'var(--success)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontWeight: 700,
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                width: 'fit-content'
                                            }}>
                                                <LuCircleCheck size={16} /> Current Default
                                            </span>
                                        ) : (
                                            <button
                                                className="icon-btn success"
                                                style={{
                                                    width: 'auto',
                                                    padding: '4px 12px',
                                                    fontSize: '0.75rem',
                                                    borderRadius: '8px',
                                                    gap: '6px',
                                                    fontWeight: 600
                                                }}
                                                onClick={() => handleSetDefault(setting.id)}
                                                title="Set as Default Tier"
                                            >
                                                <LuSparkles size={14} /> Make Default
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button
                                                className="icon-btn edit"
                                                onClick={() => openEditModal(setting)}
                                                title="Edit"
                                            >
                                                <LuPencil />
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => handleDelete(setting.id)}
                                                title="Delete"
                                            >
                                                <LuTrash2 />
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
                    <div className="form-group">
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

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label className="form-toggle">
                                <span className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_likes_enabled}
                                        onChange={e => setFormData({ ...formData, is_likes_enabled: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </span>
                                <span>Enable Likes Requirement</span>
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
                            <label className="form-toggle">
                                <span className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_comments_enabled}
                                        onChange={e => setFormData({ ...formData, is_comments_enabled: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </span>
                                <span>Enable Comments Requirement</span>
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

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
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

                    <div className="form-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        <label className="form-toggle">
                            <span className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </span>
                            <span>Active Status</span>
                        </label>
                        <label className="form-toggle">
                            <span className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.is_default}
                                    onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </span>
                            <span>Set as Default</span>
                        </label>
                    </div>
                </FormModal>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Promotion Setting"
                message="Are you sure you want to delete this setting? This action cannot be undone."
                confirmText="Delete Setting"
                confirmButtonClass="btn-danger"
            />
        </div>
    );
}
