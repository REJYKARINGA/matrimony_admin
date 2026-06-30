import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserTie, FaBuilding, FaKey, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';
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

    const [filtersOpen, setFiltersOpen] = useState(false);

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

    const activeFilterCount = selectedOfficeId ? 1 : 0;

    const filteredAgents = agents.filter(a =>
        !search || a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.phone?.includes(search) || a.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="partner-agents-page">
            <style>{`
                .partner-agents-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
                .partner-agents-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
                .partner-agents-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
                .partner-agents-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
                .partner-agents-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
                .partner-agents-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .partner-agents-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
                .partner-agents-page .um-cards { display: none; }
                .partner-agents-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
                .partner-agents-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
                .partner-agents-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
                .partner-agents-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
                .partner-agents-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
                .partner-agents-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .partner-agents-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
                .partner-agents-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
                .partner-agents-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
                .partner-agents-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
                @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
                .partner-agents-page .um-filter-drawer { display: none; }
                @media (max-width: 768px) {
                    .partner-agents-page .table-container { display: none; }
                    .partner-agents-page .um-cards { display: block; }
                    .partner-agents-page .um-filter-toggle { display: inline-flex; }
                    .partner-agents-page .filter-bar { display: none; }
                    .partner-agents-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
                    .partner-agents-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
                    .partner-agents-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
                }
                @media (min-width: 769px) { .partner-agents-page .um-filter-drawer { display: none !important; } }
            `}</style>

            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FaUserTie size={28} color="var(--primary)" />
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text)' }}>Partner Agents</h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>All Agents</h2>
                        <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPlus /> Add Agent
                        </button>
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input type="text" placeholder="Search agents..." value={search}
                                onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button type="button" className="um-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
                            {filtersOpen ? <FaTimes /> : <FaFilter />}
                            Filters
                            {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        <select value={selectedOfficeId} onChange={e => setSelectedOfficeId(e.target.value)}>
                            <option value="">All Offices</option>
                            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>

                    <div className="filter-bar" style={{ margin: 0, border: 'none', padding: 0, marginBottom: '1.5rem' }}>
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
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : filteredAgents.length === 0 ? (
                    <div className="um-empty">
                        <FaUserTie />
                        <p style={{ margin: 0, fontWeight: 600 }}>No agents found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <>
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
                        </div>

                        <div className="um-cards">
                            {filteredAgents.map(agent => (
                                <div className="um-card" key={agent.id}>
                                    <div className="um-card-top">
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{agent.name}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                <FaBuilding size={10} color="var(--primary)" style={{ marginRight: 4 }} />
                                                {agent.office?.name || '—'}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                                            fontWeight: 'bold', textTransform: 'uppercase',
                                            background: agent.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                            color: agent.status === 'active' ? '#10B981' : '#EF4444'
                                        }}>{agent.status}</span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Phone</dt>
                                            <dd>{agent.phone || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Email</dt>
                                            <dd>{agent.email || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Ref Code</dt>
                                            <dd style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{agent.user?.reference_code || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Login</dt>
                                            <dd>{agent.user_id ? <span style={{ color: '#10B981' }}><FaKey size={10} /> Active</span> : 'No Login'}</dd>
                                        </div>
                                        <div>
                                            <dt>Created</dt>
                                            <dd><TimeFormatCell date={agent.created_at} /></dd>
                                        </div>
                                    </dl>
                                    <div className="um-card-actions">
                                        <button onClick={() => openEdit(agent)} className="btn btn-secondary" title="Edit" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <FaEdit /> Edit
                                        </button>
                                        <button onClick={() => confirmDelete(agent.id)} className="btn btn-danger" title="Delete" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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
