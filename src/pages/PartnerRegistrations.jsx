import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaHandshake, FaBuilding, FaUserTie, FaFilter, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../api/axios';
import TimeFormatCell from '../components/TimeFormatCell';
import UserCell from '../components/UserCell';

export default function PartnerRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOfficeId, setSelectedOfficeId] = useState('');

    useEffect(() => {
        fetchOffices();
        fetchRegistrations();
    }, []);

    useEffect(() => { fetchRegistrations(); }, [selectedOfficeId]);

    const fetchOffices = async () => {
        try {
            const response = await api.get('/admin/partner-offices', { params: { per_page: 100 } });
            setOffices(response.data.offices.data || response.data.offices);
        } catch {}
    };

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const params = { per_page: 50 };
            if (selectedOfficeId) params.partner_office_id = selectedOfficeId;
            const resp = await api.get('/admin/partner-registrations', { params });
            setRegistrations(resp.data.registrations.data || []);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <FaHandshake size={28} color="var(--primary)" />
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text)' }}>Partner Registrations</h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <FaFilter size={14} color="var(--text-secondary)" />
                    <select value={selectedOfficeId} onChange={e => setSelectedOfficeId(e.target.value)}
                        style={{ padding: '0.6rem 1rem', background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text)', minWidth: '220px' }}>
                        <option value="">All Offices</option>
                        {offices.map(o => <option key={o.id} value={o.id}>{o.name} ({o.office_code})</option>)}
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', minWidth: '700px' }}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Matrimony ID</th>
                                    <th>Referred By</th>
                                    <th>Office</th>
                                    <th>Agent</th>
                                    <th>Purchases</th>
                                    <th>Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((ref, i) => (
                                    <tr key={ref.id || i}>
                                        <td>
                                            <UserCell user={ref.referred_user} profile={ref.referred_user?.user_profile} />
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {ref.referred_user?.matrimony_id || '—'}
                                        </td>
                                        <td>
                                            <UserCell user={ref.referred_by} profile={ref.referred_by?.user_profile} avatarSize={24} showBadge={false} />
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'rgba(var(--primary-rgb),0.1)',
                                                color: 'var(--primary)', padding: '3px 8px',
                                                borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600
                                            }}>
                                                <FaBuilding size={10} style={{ marginRight: '4px' }} />
                                                {ref.partner_office?.name || ref.partner_office_id || '—'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <FaUserTie size={10} style={{ marginRight: '4px' }} />
                                            {ref.partner_agent?.name || ref.partner_agent_id || '—'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                background: ref.purchased_count > 0 ? 'rgba(16,185,129,0.12)' : 'transparent',
                                                color: ref.purchased_count > 0 ? '#10B981' : 'var(--text-secondary)',
                                                fontWeight: 700, padding: '4px 12px', borderRadius: '20px',
                                                fontSize: '0.85rem'
                                            }}>{ref.purchased_count || 0}</span>
                                        </td>
                                        <td><TimeFormatCell date={ref.created_at} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {registrations.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <FaHandshake size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No registrations found.</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
