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

    const getStatusBadge = (status) => {
        return <span className={`badge ${status === 'paid' ? 'badge-verified' : status === 'rejected' ? 'badge-rejected' : 'badge-warning'}`}>{status}</span>;
    };

    return (
        <div className="partner-payouts-page">
            <style>{`
                .partner-payouts-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .partner-payouts-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .partner-payouts-page .um-cards { display: none; }
                .partner-payouts-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .partner-payouts-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .partner-payouts-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .partner-payouts-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .partner-payouts-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .partner-payouts-page .um-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .partner-payouts-page .um-card-actions .btn {
                    flex: 1 1 auto;
                    justify-content: center;
                    padding: 0.55rem 0.75rem;
                }
                .partner-payouts-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .partner-payouts-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .partner-payouts-page .um-skel-row {
                    height: 56px;
                    border-radius: 10px;
                    margin-bottom: 0.6rem;
                    background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%);
                    background-size: 400% 100%;
                    animation: um-shimmer 1.4s ease infinite;
                }
                @keyframes um-shimmer {
                    0% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
                @media (max-width: 768px) {
                    .partner-payouts-page .um-table-wrap { display: none; }
                    .partner-payouts-page .um-cards { display: block; }
                    .partner-payouts-page .um-card-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}><FaMoneyCheck /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>Partner Payouts</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Manage and process payout requests from partner offices</p>
                            </div>
                        </div>
                    </div>
                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <FaFilter size={14} color="var(--text-secondary)" />
                        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: '160px' }}>
                            <option value="all">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="um-empty">
                        <FaMoneyCheck />
                        <p style={{ margin: 0, fontWeight: 600 }}>No payouts found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>No payout requests have been submitted yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
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
                                                <td style={{ textAlign: 'center' }}>{getStatusBadge(p.status)}</td>
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
                                                            <button onClick={() => openProcess(p)} className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                                <FaCheck /> Pay
                                                            </button>
                                                            <button onClick={() => openReject(p)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                                                <FaTimes /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {payouts.map(p => (
                                <div className="um-card" key={p.id}>
                                    <div className="um-card-top">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                            <FaBuilding size={12} color="var(--primary)" />
                                            {p.office?.name || '—'}
                                        </div>
                                        <span className={`badge ${p.status === 'paid' ? 'badge-verified' : p.status === 'rejected' ? 'badge-rejected' : 'badge-warning'}`}>{p.status}</span>
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Amount</dt>
                                            <dd style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{Number(p.amount).toLocaleString()}</dd>
                                        </div>
                                        <div>
                                            <dt>Transfer ID</dt>
                                            <dd style={{ fontFamily: 'monospace' }}>{p.transfer_id || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Requested</dt>
                                            <dd><TimeFormatCell date={p.created_at} /></dd>
                                        </div>
                                        <div>
                                            <dt>Processed</dt>
                                            <dd><TimeFormatCell date={p.processed_at} /></dd>
                                        </div>
                                        <div>
                                            <dt>Notes</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{p.notes || '—'}</dd>
                                        </div>
                                        <div>
                                            <dt>Processed By</dt>
                                            <dd>{p.processed_by?.name || p.processed_by_id || '—'}</dd>
                                        </div>
                                    </dl>
                                    {p.status === 'pending' && (
                                        <div className="um-card-actions">
                                            <button onClick={() => openProcess(p)} className="btn btn-success">
                                                <FaCheck /> Pay
                                            </button>
                                            <button onClick={() => openReject(p)} className="btn btn-danger">
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

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
