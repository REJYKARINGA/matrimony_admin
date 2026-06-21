import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBuilding, FaMapMarkerAlt, FaPhone, FaRupeeSign, FaUserTie, FaHandshake, FaMoneyCheck, FaEye, FaToggleOn, FaToggleOff, FaShareAlt } from 'react-icons/fa';
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

    return (
        <div style={{ padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FaBuilding size={28} color="var(--primary)" />
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text)' }}>Partner Offices</h1>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible"
                style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input type="text" placeholder="Search offices..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '40px', width: '280px', background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: '10px' }} />
                    </div>
                    <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPlus /> Add Partner Office
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : (
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
                                                <button onClick={() => navigate(`/partner/dashboard?office_id=${office.id}`)} className="btn-icon" title="Open Dashboard"
                                                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                                    <FaShareAlt />
                                                </button>
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
                        {filteredOffices.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <FaBuilding size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No partner offices found.</p>
                            </div>
                        )}
                    </div>
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
