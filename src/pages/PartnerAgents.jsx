import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserTie, FaBuilding, FaKey } from 'react-icons/fa';
import api from '../api/axios';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function PartnerAgents() {
    const [agents, setAgents] = useState([]);
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOfficeId, setSelectedOfficeId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });
    const { showToast, ToastComponent } = useToast();

    const [formData, setFormData] = useState({
        partner_office_id: '',
        name: '',
        phone: '',
        email: '',
        status: 'active',
        create_login: false,
        password: '',
    });

    useEffect(() => {
        fetchAgents();
        fetchOffices();
    }, []);

    const fetchOffices = async () => {
        try {
            const response = await api.get('/admin/partner-offices', { params: { per_page: 100 } });
            setOffices(response.data.offices.data || response.data.offices);
        } catch {}
    };

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const params = { per_page: 50 };
            if (selectedOfficeId) params.partner_office_id = selectedOfficeId;
            const response = await api.get('/admin/partner-agents', { params });
            setAgents(response.data.agents.data || response.data.agents);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAgents(); }, [selectedOfficeId]);

    const openCreate = () => {
        setEditingId(null);
        setFormData({ partner_office_id: offices[0]?.id || '', name: '', phone: '', email: '', status: 'active', create_login: false, password: '' });
        setIsModalOpen(true);
    };

    const openEdit = (agent) => {
        setEditingId(agent.id);
        setFormData({
            partner_office_id: agent.partner_office_id,
            name: agent.name,
            phone: agent.phone || '',
            email: agent.email || '',
            status: agent.status,
            create_login: false,
            password: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/admin/partner-agents/${editingId}`, formData);
                showToast('Agent updated successfully');
            } else {
                await api.post('/admin/partner-agents', formData);
                showToast('Agent created successfully');
            }
            setIsModalOpen(false);
            fetchAgents();
        } catch (error) {
            showToast(error.response?.data?.error || 'Operation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id) => {
        setConfirmState({ isOpen: true, id });
    };

    const handleDelete = async () => {
        const id = confirmState.id;
        try {
            await api.delete(`/admin/partner-agents/${id}`);
            showToast('Agent deleted');
            fetchAgents();
        } catch (error) {
            showToast('Failed to delete', 'error');
        } finally {
            setConfirmState({ isOpen: false, id: null });
        }
    };

    const handleToggleLogin = () => {
        setFormData({ ...formData, create_login: !formData.create_login, password: '' });
    };

    const filteredAgents = agents.filter(a =>
        !search || a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.phone?.includes(search) || a.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FaUserTie size={28} color="var(--primary)" />
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text)' }}>Partner Agents</h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input type="text" placeholder="Search agents..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '40px', width: '250px', background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: '10px' }} />
                        </div>
                        <select value={selectedOfficeId} onChange={e => setSelectedOfficeId(e.target.value)}
                            style={{ padding: '0.6rem 1rem', background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text)', minWidth: '200px' }}>
                            <option value="">All Offices</option>
                            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                    <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPlus /> Add Agent
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', minWidth: '700px' }}>
                            <thead>
                                <tr>
                                    <th>Agent</th>
                                    <th>Office</th>
                                    <th>Contact</th>
                                    <th style={{ textAlign: 'center' }}>Ref Code</th>
                                    <th style={{ textAlign: 'center' }}>Login</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th>Created</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAgents.map(agent => (
                                    <tr key={agent.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{agent.name}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                <FaBuilding size={12} color="var(--primary)" />
                                                {agent.office?.name || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{agent.phone}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{agent.email}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {agent.user?.reference_code ? (
                                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px', background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px', border: '1px dashed var(--border-color)' }}>
                                                    {agent.user.reference_code}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {agent.user_id ? (
                                                <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>
                                                    <FaKey size={12} style={{ marginRight: '4px' }} /> Active
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No Login</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                                                fontWeight: 'bold', textTransform: 'uppercase',
                                                background: agent.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                color: agent.status === 'active' ? '#10B981' : '#EF4444'
                                            }}>{agent.status}</span>
                                        </td>
                                        <td><TimeFormatCell date={agent.created_at} /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => openEdit(agent)} className="btn-icon" title="Edit"
                                                    style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => confirmDelete(agent.id)} className="btn-icon" title="Delete"
                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAgents.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <FaUserTie size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No agents found.</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {isModalOpen && (
                <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                    title={editingId ? 'Edit Agent' : 'Add Agent'}
                    onSubmit={handleSubmit} isLoading={submitting}>
                    <div className="form-group">
                        <label>Office *</label>
                        <select className="form-control" value={formData.partner_office_id}
                            onChange={e => setFormData({ ...formData, partner_office_id: e.target.value })} required>
                            <option value="">Select Office</option>
                            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Name *</label>
                        <input className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Phone</label>
                            <input className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Email</label>
                            <input className="form-control" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
                        {!editingId && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Create Login</label>
                                <div 
                                    onClick={handleToggleLogin}
                                    style={{
                                        width: '44px', height: '24px', borderRadius: '12px',
                                        background: formData.create_login ? '#10B981' : 'var(--border-color)',
                                        position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: '2px', left: formData.create_login ? '22px' : '2px',
                                        transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</label>
                            <div 
                                onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <div style={{
                                    width: '44px', height: '24px', borderRadius: '12px',
                                    background: formData.status === 'active' ? '#10B981' : 'var(--border-color)',
                                    position: 'relative', transition: 'background 0.3s'
                                }}>
                                    <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: '2px', left: formData.status === 'active' ? '22px' : '2px',
                                        transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: formData.status === 'active' ? '#10B981' : 'var(--text-secondary)' }}>
                                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {!editingId && formData.create_login && (
                        <div className="form-group">
                            <label>Password *</label>
                            <input className="form-control" type="password" value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })} minLength={6} required />
                        </div>
                    )}
                </FormModal>
            )}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Agent"
                message="Are you sure you want to delete this agent?"
                confirmText="Delete"
                confirmButtonClass="btn-danger"
                cancelText="Cancel"
            />
            <ToastComponent />
        </div>
    );
}
