import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBuilding, FaMapMarkerAlt, FaPhone, FaRupeeSign, FaUserTie, FaHandshake, FaMoneyCheck, FaEye, FaToggleOn, FaToggleOff, FaShareAlt, FaTimes, FaChevronDown, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import FormModal from '../components/FormModal';
import TimeFormatCell from '../components/TimeFormatCell';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } }
};

export default function PartnerOffices() {
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [officeStats, setOfficeStats] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });
    const { showToast, ToastComponent } = useToast();

    const [filtersOpen, setFiltersOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        commission_per_registration: 0,
        revenue_share_percent: 0,
        status: 'active',
    });

    useEffect(() => { fetchOffices(); }, []);

    const fetchOffices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/partner-offices', { params: { per_page: 50 } });
            setOffices(response.data.offices.data || response.data.offices);
        } catch (error) {
            console.error('Failed to fetch offices:', error);
            showToast('Failed to load partner offices', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setFormData({
            name: '', contact_person: '', phone: '', email: '', address: '',
            city: '', state: '', pincode: '', commission_per_registration: 0,
            revenue_share_percent: 0, status: 'active',
        });
        setIsModalOpen(true);
    };

    const openEdit = (office) => {
        setEditingId(office.id);
        setFormData({
            name: office.name,
            contact_person: office.contact_person || '',
            phone: office.phone || '',
            email: office.email || '',
            address: office.address || '',
            city: office.city || '',
            state: office.state || '',
            pincode: office.pincode || '',
            commission_per_registration: Number(office.commission_per_registration),
            revenue_share_percent: Number(office.revenue_share_percent),
            status: office.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/admin/partner-offices/${editingId}`, formData);
                showToast('Partner office updated successfully');
            } else {
                await api.post('/admin/partner-offices', formData);
                showToast('Partner office created successfully');
            }
            setIsModalOpen(false);
            fetchOffices();
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
            await api.delete(`/admin/partner-offices/${id}`);
            showToast('Partner office deleted');
            fetchOffices();
        } catch (error) {
            showToast('Failed to delete', 'error');
        } finally {
            setConfirmState({ isOpen: false, id: null });
        }
    };

    const viewDetails = async (office) => {
        setSelectedOffice(office);
        setIsDetailOpen(true);
        try {
            const response = await api.get(`/admin/partner-offices/${office.id}/stats`);
            setOfficeStats(response.data.stats);
        } catch {
            setOfficeStats(null);
        }
    };

    const filteredOffices = offices.filter(o =>
        !search || o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.office_code?.toLowerCase().includes(search.toLowerCase()) ||
        o.city?.toLowerCase().includes(search.toLowerCase())
    );

    const activeFilterCount = 0;

    return (
        <div className="partner-offices-page">
            <style>{`
                .partner-offices-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
                .partner-offices-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
                .partner-offices-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
                .partner-offices-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
                .partner-offices-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
                .partner-offices-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .partner-offices-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
                .partner-offices-page .um-cards { display: none; }
                .partner-offices-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
                .partner-offices-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
                .partner-offices-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
                .partner-offices-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
                .partner-offices-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
                .partner-offices-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .partner-offices-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
                .partner-offices-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
                .partner-offices-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
                .partner-offices-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
                @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
                .partner-offices-page .um-filter-drawer { display: none; }
                @media (max-width: 768px) {
                    .partner-offices-page .table-container { display: none; }
                    .partner-offices-page .um-cards { display: block; }
                    .partner-offices-page .um-filter-toggle { display: inline-flex; }
                    .partner-offices-page .filter-bar { display: none; }
                    .partner-offices-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
                    .partner-offices-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
                    .partner-offices-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
                }
                @media (min-width: 769px) { .partner-offices-page .um-filter-drawer { display: none !important; } }
            `}</style>

            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FaBuilding size={28} color="var(--primary)" />
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text)' }}>Partner Offices</h1>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible"
                style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>All Offices</h2>
                        <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPlus /> Add Partner Office
                        </button>
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input type="text" placeholder="Search offices..." value={search}
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
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input type="text" placeholder="Search offices..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '40px', width: '280px', background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: '10px' }} />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : filteredOffices.length === 0 ? (
                    <div className="um-empty">
                        <FaBuilding />
                        <p style={{ margin: 0, fontWeight: 600 }}>No partner offices found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th>Office</th>
                                        <th>Code</th>
                                        <th>Contact</th>
                                        <th>Location</th>
                                        <th style={{ textAlign: 'center' }}>Commission</th>
                                        <th style={{ textAlign: 'center' }}>Revenue Share</th>
                                        <th style={{ textAlign: 'center' }}>Agents</th>
                                        <th style={{ textAlign: 'center' }}>Registrations</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                        <th>Created</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOffices.map((office) => (
                                        <tr key={office.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{office.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{office.contact_person}</div>
                                            </td>
                                            <td><code style={{ background: 'var(--bg)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>{office.office_code}</code></td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{office.phone}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{office.email}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                                    <FaMapMarkerAlt size={10} /> {office.city || '—'}, {office.state || ''}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{Number(office.commission_per_registration).toLocaleString()}</span>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>per reg.</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ fontWeight: 600, color: '#10B981' }}>{office.revenue_share_percent}%</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{office.agents_count || 0}</td>
                                            <td style={{ textAlign: 'center' }}>{office.referred_users_count || 0}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                                                    fontWeight: 'bold', textTransform: 'uppercase',
                                                    background: office.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                    color: office.status === 'active' ? '#10B981' : '#EF4444'
                                                }}>{office.status}</span>
                                            </td>
                                            <td><TimeFormatCell date={office.created_at} /></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => viewDetails(office)} className="btn-icon" title="View Stats"
                                                        style={{ background: 'rgba(var(--primary-rgb),0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                                        <FaEye />
                                                    </button>
                                                    <button onClick={() => openEdit(office)} className="btn-icon" title="Edit"
                                                        style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => confirmDelete(office.id)} className="btn-icon" title="Delete"
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
                            {filteredOffices.map((office) => (
                                <div className="um-card" key={office.id}>
                                    <div className="um-card-top">
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{office.name}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{office.contact_person || '—'}</div>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                                            fontWeight: 'bold', textTransform: 'uppercase',
                                            background: office.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                            color: office.status === 'active' ? '#10B981' : '#EF4444'
                                        }}>{office.status}</span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Code</dt>
                                            <dd style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{office.office_code || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Contact</dt>
                                            <dd>{office.phone || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Location</dt>
                                            <dd><FaMapMarkerAlt size={9} /> {office.city || '—'}, {office.state || ''}</dd>
                                        </div>
                                        <div>
                                            <dt>Email</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{office.email || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Commission</dt>
                                            <dd style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{Number(office.commission_per_registration).toLocaleString()}</dd>
                                        </div>
                                        <div>
                                            <dt>Revenue Share</dt>
                                            <dd style={{ color: '#10B981', fontWeight: 600 }}>{office.revenue_share_percent}%</dd>
                                        </div>
                                        <div>
                                            <dt>Agents</dt>
                                            <dd>{office.agents_count || 0}</dd>
                                        </div>
                                        <div>
                                            <dt>Registrations</dt>
                                            <dd>{office.referred_users_count || 0}</dd>
                                        </div>
                                        <div>
                                            <dt>Created</dt>
                                            <dd><TimeFormatCell date={office.created_at} /></dd>
                                        </div>
                                    </dl>
                                    <div className="um-card-actions">
                                        <button onClick={() => viewDetails(office)} className="btn btn-secondary" title="View Stats" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <FaEye /> Stats
                                        </button>
                                        <button onClick={() => openEdit(office)} className="btn btn-secondary" title="Edit" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <FaEdit /> Edit
                                        </button>
                                        <button onClick={() => confirmDelete(office.id)} className="btn btn-danger" title="Delete" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
                    title={editingId ? 'Edit Partner Office' : 'Add Partner Office'}
                    onSubmit={handleSubmit} isLoading={submitting} size="lg">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 250px' }}>
                            <label>Office Name *</label>
                            <input className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Contact Person</label>
                            <input className="form-control" value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Phone</label>
                            <input className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 250px' }}>
                            <label>Email</label>
                            <input className="form-control" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea className="form-control" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>City</label>
                            <input className="form-control" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>State</label>
                            <input className="form-control" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 100px' }}>
                            <label>Pincode</label>
                            <input className="form-control" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Commission per Registration (₹)</label>
                            <input className="form-control" type="number" min="0" step="0.01"
                                value={formData.commission_per_registration}
                                onChange={e => setFormData({ ...formData, commission_per_registration: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 200px' }}>
                            <label>Revenue Share (%)</label>
                            <input className="form-control" type="number" min="0" max="100" step="0.01"
                                value={formData.revenue_share_percent}
                                onChange={e => setFormData({ ...formData, revenue_share_percent: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flex: '1 1 150px' }}>
                            <label>Status</label>
                            <select className="form-control" value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </FormModal>
            )}

            {isDetailOpen && selectedOffice && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)'
                }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{selectedOffice.name}</h2>
                            <button onClick={() => setIsDetailOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)' }}>&times;</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                <FaUserTie size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{officeStats?.total_registrations || 0}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registrations</div>
                            </div>
                            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                <FaRupeeSign size={20} color="#10B981" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>₹{(officeStats?.total_revenue_generated || 0).toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revenue Generated</div>
                            </div>
                            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                <FaMoneyCheck size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>₹{(officeStats?.total_earned || 0).toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Earned</div>
                            </div>
                            <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                <FaMoneyCheck size={20} color="#F59E0B" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>₹{(officeStats?.pending_payout || 0).toLocaleString()}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending Payout</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <p><strong>Code:</strong> {selectedOffice.office_code}</p>
                            <p><strong>Commission:</strong> ₹{Number(selectedOffice.commission_per_registration)} per registration + {selectedOffice.revenue_share_percent}% revenue share</p>
                            <p><strong>Paid so far:</strong> ₹{(officeStats?.total_paid || 0).toLocaleString()}</p>
                        </div>
                    </motion.div>
                </div>
            )}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Office"
                message="Are you sure you want to delete this partner office?"
                confirmText="Delete"
                confirmButtonClass="btn-danger"
                cancelText="Cancel"
            />
            <ToastComponent />
        </div>
    );
}
