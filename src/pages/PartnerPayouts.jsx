import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMoneyCheck, FaCheck, FaTimes, FaBuilding, FaFilter, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../api/axios';
import TimeFormatCell from '../components/TimeFormatCell';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function PartnerPayouts() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [confirmState, setConfirmState] = useState({ 
        isOpen: false, payout: null, action: null, title: '', message: '', 
        inputPlaceholder: '', inputValue: '' 
    });
    const { showToast, ToastComponent } = useToast();

    useEffect(() => { fetchPayouts(); }, [filter]);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const params = { per_page: 50 };
            if (filter !== 'all') params.status = filter;
            const response = await api.get('/admin/partner-payouts', { params });
            setPayouts(response.data.payouts.data || response.data.payouts);
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const openProcess = (payout) => {
        setConfirmState({
            isOpen: true, payout, action: 'process',
            title: 'Process Payout',
            message: `Mark payout of ₹${Number(payout.amount).toLocaleString()} as paid?`,
            inputPlaceholder: 'Enter transfer/transaction ID (optional)',
            inputValue: ''
        });
    };

    const openReject = (payout) => {
        setConfirmState({
            isOpen: true, payout, action: 'reject',
            title: 'Reject Payout',
            message: 'Are you sure you want to reject this payout request?',
            inputPlaceholder: 'Reason for rejection (optional)',
            inputValue: ''
        });
    };

    const handleConfirm = async (inputValue) => {
        const { payout, action } = confirmState;
        if (!payout) return;

        try {
            if (action === 'process') {
                await api.post(`/admin/partner-payouts/${payout.id}/process`, { transfer_id: inputValue || null });
                showToast('Payout processed successfully');
            } else if (action === 'reject') {
                await api.post(`/admin/partner-payouts/${payout.id}/reject`, { notes: inputValue || 'Rejected by admin' });
                showToast('Payout rejected');
            }
            fetchPayouts();
        } catch (error) {
            showToast(error.response?.data?.error || `Failed to ${action} payout`, 'error');
        } finally {
            setConfirmState({ ...confirmState, isOpen: false, payout: null });
        }
    };

    const statusColor = (status) => {
        const colors = { pending: '#F59E0B', paid: '#10B981', rejected: '#EF4444' };
        return colors[status] || '#999';
    };

    return (
        <div style={{ padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FaMoneyCheck size={28} color="var(--primary)" />
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text)' }}>Partner Payouts</h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaFilter size={14} color="var(--text-secondary)" />
                        <select value={filter} onChange={e => setFilter(e.target.value)}
                            style={{ padding: '0.6rem 1rem', background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text)', minWidth: '160px' }}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th>Office</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th>Transfer ID</th>
                                    <th>Notes</th>
                                    <th>Processed By</th>
                                    <th>Requested</th>
                                    <th>Processed</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaBuilding size={12} color="var(--primary)" />
                                                <span style={{ fontWeight: 600 }}>{p.office?.name || '—'}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>
                                            ₹{Number(p.amount).toLocaleString()}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                                                fontWeight: 'bold', textTransform: 'uppercase',
                                                background: `${statusColor(p.status)}20`, color: statusColor(p.status)
                                            }}>{p.status}</span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.transfer_id || '—'}</td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {p.notes || '—'}
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{p.processed_by?.name || p.processed_by_id || '—'}</td>
                                        <td><TimeFormatCell date={p.created_at} /></td>
                                        <td><TimeFormatCell date={p.processed_at} /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            {p.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button onClick={() => openProcess(p)}
                                                        style={{
                                                            background: 'rgba(16,185,129,0.12)', color: '#10B981',
                                                            border: 'none', padding: '8px 12px', borderRadius: '8px',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                            fontWeight: 600, fontSize: '0.8rem'
                                                        }}>
                                                        <FaCheck /> Pay
                                                    </button>
                                                    <button onClick={() => openReject(p)}
                                                        style={{
                                                            background: 'rgba(239,68,68,0.12)', color: '#EF4444',
                                                            border: 'none', padding: '8px 12px', borderRadius: '8px',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                            fontWeight: 600, fontSize: '0.8rem'
                                                        }}>
                                                        <FaTimes /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payouts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <FaMoneyCheck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No payouts found.</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false, payout: null })}
                onConfirm={handleConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.action === 'process' ? 'Process Payment' : 'Reject'}
                confirmButtonClass={confirmState.action === 'process' ? 'btn-primary' : 'btn-danger'}
                cancelText="Cancel"
                showInput={true}
                inputPlaceholder={confirmState.inputPlaceholder}
                inputValue={confirmState.inputValue}
                onInputChange={(val) => setConfirmState(s => ({ ...s, inputValue: val }))}
            />
            <ToastComponent />
        </div>
    );
}
