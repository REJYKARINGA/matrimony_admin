import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { LuPencil, LuTrash2, LuArrowUpDown, LuIndianRupee, LuUsers } from 'react-icons/lu';
import FormModal from '../components/FormModal';
import ConfirmModal from '../components/ConfirmModal';

export default function RechargeTiers() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);
    const [formData, setFormData] = useState({ amount: '', contacts: '', priority_order: '', is_active: true });

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            const res = await api.get('/admin/recharge-tiers');
            setTiers(res.data.tiers);
        } catch (err) {
            console.error('Failed to fetch tiers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/admin/recharge-tiers/${editingId}`, formData);
            } else {
                await api.post('/admin/recharge-tiers', formData);
            }
            fetchTiers();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Failed to save tier:', err);
            alert('Failed to save tier');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/admin/recharge-tiers/${deleteId}`);
            fetchTiers();
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (err) {
            console.error('Failed to delete tier:', err);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const toggleActive = async (id) => {
        try {
            await api.put(`/admin/recharge-tiers/${id}/toggle-active`);
            fetchTiers();
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ amount: '', contacts: '', priority_order: '', is_active: true });
    };

    const openEditModal = (tier) => {
        setEditingId(tier.id);
        setFormData({
            amount: tier.amount,
            contacts: tier.contacts,
            priority_order: tier.priority_order,
            is_active: Boolean(tier.is_active),
        });
        setIsModalOpen(true);
    };

    const persistReorder = useCallback(async (ordered) => {
        const payload = ordered.map((t, i) => ({ id: t.id, priority_order: i }));
        try {
            await api.post('/admin/recharge-tiers/reorder', { tiers: payload });
        } catch (err) {
            console.error('Failed to reorder:', err);
        }
    }, []);

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setOverIndex(index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === overIndex) {
            setDragIndex(null);
            setOverIndex(null);
            return;
        }

        const updated = [...tiers];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(overIndex, 0, moved);

        const reindexed = updated.map((t, i) => ({ ...t, priority_order: i }));
        setTiers(reindexed);
        setDragIndex(null);
        setOverIndex(null);

        persistReorder(reindexed);
    };

    return (
        <div className="recharge-tiers-page card">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                        <LuIndianRupee size={22} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Recharge Tiers</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage wallet recharge pricing tiers</p>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    style={{ borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                >
                    + Add Tier
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '1rem' }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="um-skel-row" />)}</div>
            ) : (
                <>
                <div className="um-table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Amount</th>
                                <th>Contacts</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.map((tier, index) => (
                                <tr
                                    key={tier.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={handleDrop}
                                    onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                                    style={{
                                        opacity: dragIndex === index ? 0.5 : 1,
                                        borderTop: overIndex === index ? '2px solid var(--primary)' : undefined,
                                        cursor: 'grab',
                                    }}
                                >
                                    <td>
                                        <span style={{ color: 'var(--text-secondary)', cursor: 'grab', display: 'flex' }}>
                                            <LuArrowUpDown size={18} />
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                                        ₹{Number(tier.amount).toLocaleString()}
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <LuUsers size={16} color="var(--primary)" />
                                            {tier.contacts}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-verified" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                            #{tier.priority_order + 1}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleActive(tier.id)}
                                            className={`badge ${tier.is_active ? 'badge-verified' : 'badge-rejected'}`}
                                            style={{ border: 'none', cursor: 'pointer', padding: '4px 12px', fontSize: '0.8rem' }}
                                        >
                                            {tier.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button className="icon-btn edit" onClick={() => openEditModal(tier)} title="Edit">
                                                <LuPencil />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(tier.id)} title="Delete">
                                                <LuTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tiers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                        No recharge tiers defined. Click "Add Tier" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="um-cards" style={{ padding: '1rem' }}>
                    {tiers.length === 0 ? (
                        <div className="um-empty"><p>No recharge tiers defined. Click "Add Tier" to create one.</p></div>
                    ) : (
                        tiers.map(tier => (
                            <div key={tier.id} className="um-card">
                                <div className="um-card-top">
                                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>₹{Number(tier.amount).toLocaleString()}</span>
                                    <button
                                        onClick={() => toggleActive(tier.id)}
                                        className={`badge ${tier.is_active ? 'badge-verified' : 'badge-rejected'}`}
                                        style={{ border: 'none', cursor: 'pointer', padding: '4px 12px', fontSize: '0.75rem' }}
                                    >
                                        {tier.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                                <div className="um-card-grid">
                                    <div><dt>Contacts</dt><dd><LuUsers size={14} color="var(--primary)" /> {tier.contacts}</dd></div>
                                    <div><dt>Priority</dt><dd><span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}>#{tier.priority_order + 1}</span></dd></div>
                                </div>
                                <div className="um-card-actions">
                                    <button className="btn btn-primary" onClick={() => openEditModal(tier)} style={{ flex: 1, justifyContent: 'center', borderRadius: '8px' }}><LuPencil size={12} /> Edit</button>
                                    <button className="btn" onClick={() => handleDelete(tier.id)} style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--danger)' }}><LuTrash2 size={12} /> Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                </>
            )}

            {isModalOpen && (
                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingId ? 'Edit Recharge Tier' : 'Add Recharge Tier'}
                    onSubmit={handleSubmit}
                    isLoading={submitting}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                                min="1"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Contacts Unlocked</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.contacts}
                                onChange={e => setFormData({ ...formData, contacts: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Priority Order</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.priority_order}
                                onChange={e => setFormData({ ...formData, priority_order: e.target.value })}
                                min="0"
                            />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                            <label className="form-toggle">
                                <span className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </span>
                                <span>Active</span>
                            </label>
                        </div>
                    </div>
                </FormModal>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeleteId(null); }}
                onConfirm={confirmDelete}
                title="Delete Recharge Tier"
                message="Are you sure you want to delete this tier? This action cannot be undone."
                confirmText="Delete Tier"
                confirmButtonClass="btn-danger"
            />
        </div>
    );
}
