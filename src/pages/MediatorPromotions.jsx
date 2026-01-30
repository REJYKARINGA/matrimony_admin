import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';


export default function MediatorPromotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        status: 'pending',
        calculated_payout: ''
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await api.get('/admin/mediator-promotions');
            setPromotions(response.data.promotions);
        } catch (error) {
            console.error('Failed to fetch promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/mediator-promotions/${editingId}`, formData);
            fetchPromotions();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update promotion:', error);
            alert('Failed to update promotion');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) return;
        try {
            await api.delete(`/admin/mediator-promotions/${id}`);
            fetchPromotions();
        } catch (error) {
            console.error('Failed to delete promotion:', error);
        }
    };

    const openEditModal = (promotion) => {
        setEditingId(promotion.id);
        setFormData({
            views_count: promotion.views_count,
            likes_count: promotion.likes_count,
            comments_count: promotion.comments_count,
            status: promotion.status,
            calculated_payout: promotion.calculated_payout
        });
        setIsModalOpen(true);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ margin: '0 0 2rem 0', color: 'var(--text)' }}>Mediator Promotions</h1>

            {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Mediator</th>
                                <th>Platform</th>
                                <th>Link</th>
                                <th>Stats (V/L/C)</th>
                                <th>Payout</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Actions</th>

                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map((promo) => (
                                <tr key={promo.id}>
                                    <td>
                                        <div>{promo.user?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{promo.user?.email}</div>
                                    </td>
                                    <td>{promo.platform}</td>
                                    <td>
                                        <a href={promo.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                                            View <FaExternalLinkAlt size={12} />
                                        </a>
                                    </td>
                                    <td>
                                        {promo.views_count} / {promo.likes_count} / {promo.comments_count}
                                    </td>
                                    <td>₹{Number(promo.calculated_payout).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge status-${promo.status}`}>
                                            {promo.status}
                                        </span>
                                    </td>
                                    <td><TimeFormatCell date={promo.updated_at} /></td>

                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="icon-btn edit"
                                                onClick={() => openEditModal(promo)}
                                                title="Edit / Verify"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => handleDelete(promo.id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {promotions.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No promotions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Update Promotion Status"
                    onSubmit={handleSubmit}
                    isLoading={submitting}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Views Count</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.views_count}
                                onChange={e => setFormData({ ...formData, views_count: e.target.value })}
                                min="0"
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Likes Count</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.likes_count}
                                onChange={e => setFormData({ ...formData, likes_count: e.target.value })}
                                min="0"
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Comments Count</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.comments_count}
                                onChange={e => setFormData({ ...formData, comments_count: e.target.value })}
                                min="0"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Status</label>
                            <select
                                className="form-control"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Calculated Payout (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.calculated_payout}
                                onChange={e => setFormData({ ...formData, calculated_payout: e.target.value })}
                                min="0"
                                step="0.01"
                            />
                            <small style={{ color: 'var(--text-secondary)' }}>Leave as is to auto-calculate based on counts</small>
                        </div>
                    </div>
                </FormModal>
            )}
        </div>
    );
}
