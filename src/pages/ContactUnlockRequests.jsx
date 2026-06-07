import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { contactUnlockRequestApi } from '../api/contactUnlockRequestApi';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { FaArrowRight, FaSearch, FaFilter, FaCalendarAlt, FaCheck, FaTimes, FaHourglassHalf, FaUnlock } from 'react-icons/fa';
import { LuCheck, LuTriangleAlert } from 'react-icons/lu';

const getAvatarSrc = (gender) => {
    const isMale = ['male', 'm', 'groom'].includes(String(gender).toLowerCase());
    const c1 = isMale ? '%2360a5fa' : '%23f472b6';
    const c2 = isMale ? '%232563eb' : '%23db2777';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${c1}'/%3E%3Cstop offset='100%25' stop-color='${c2}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23bg)'/%3E%3Ccircle cx='50' cy='36' r='18' fill='white'/%3E%3Cpath d='M15,100 Q15,65 50,65 Q85,65 85,100 Z' fill='white'/%3E%3C/svg%3E`;
};

const UserAvatar = ({ user, style }) => {
    const picture = user?.user_profile?.profile_picture;
    const gender = user?.user_profile?.gender;
    const src = picture
        ? (picture.startsWith('http') ? picture : `${import.meta.env.VITE_API_BASE_URL}/storage/${picture}`)
        : getAvatarSrc(gender);

    return (
        <img
            src={src}
            alt=""
            style={{
                width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover',
                background: 'var(--sidebar-bg)', ...style
            }}
            onError={(e) => { e.target.onerror = null; e.target.src = getAvatarSrc(gender); }}
        />
    );
};

export default function ContactUnlockRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: '' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchRequests = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, search };
            if (statusFilter) params.status = statusFilter;
            const response = await contactUnlockRequestApi.getRequests(params);
            setRequests(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setTotalPages(response.data.last_page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch unlock requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(1);
    }, [search, statusFilter]);

    const handleRespond = async () => {
        if (!confirmModal.id) return;
        try {
            const response = await contactUnlockRequestApi.respondToRequest(confirmModal.id, confirmModal.action);
            showToast(response.data.message);
            setConfirmModal({ open: false, id: null, action: '' });
            fetchRequests(currentPage);
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to respond', 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getUserName = (user) => {
        if (!user) return 'Unknown';
        if (user.user_profile) return `${user.user_profile.first_name} ${user.user_profile.last_name}`;
        return user.name || user.matrimony_id || 'Unknown';
    };

    const statusBadge = (status) => {
        const styles = {
            pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' },
            approved: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' },
            rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' },
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {status === 'pending' && <FaHourglassHalf size={12} />}
                {status === 'approved' && <FaCheck size={12} />}
                {status === 'rejected' && <FaTimes size={12} />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div style={{ padding: 'min(1.5rem, 5vw)' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                    <FaUnlock /> Contact Unlock Requests
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Review and manage user requests to unlock contact details
                </p>
            </motion.div>

            <div style={{
                background: 'var(--card-bg)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem',
                border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: '1 1 250px' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input type="text" placeholder="Search by name, matrimony ID or email..." value={search}
                        onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '40px', width: '100%', marginBottom: 0 }} />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 'auto', minWidth: '140px', marginBottom: 0 }}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <FaFilter size={14} />
                    <span style={{ fontSize: '0.9rem' }}>{totalItems} Results</span>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead style={{ background: 'var(--sidebar-bg)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem 1.5rem' }}>Requester</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                                <th>Target User</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }}>Responded At</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Requested At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '5rem' }}>
                                        <div className="loader" style={{ margin: '0 auto' }}></div>
                                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading requests...</p>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
                                        No unlock requests found.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((item, index) => (
                                    <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                                        style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <UserAvatar user={item.requester} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{getUserName(item.requester)}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.requester?.matrimony_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ color: 'var(--primary)', opacity: 0.5 }}><FaArrowRight /></div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <UserAvatar user={item.target_user} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{getUserName(item.target_user)}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.target_user?.matrimony_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{statusBadge(item.status)}</td>
                                        <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {formatDate(item.responded_at)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {item.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button className="icon-btn success" title="Approve"
                                                        onClick={() => setConfirmModal({ open: true, id: item.id, action: 'approved' })}>
                                                        <FaCheck />
                                                    </button>
                                                    <button className="icon-btn delete" title="Reject"
                                                        onClick={() => setConfirmModal({ open: true, id: item.id, action: 'rejected' })}>
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>--</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <FaCalendarAlt size={12} />
                                                {formatDate(item.created_at)}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '1rem', background: 'var(--card-bg)' }}>
                    <Pagination currentPage={currentPage} totalPages={totalPages}
                        onPageChange={(page) => fetchRequests(page)} totalItems={totalItems} itemsPerPage={20} />
                </div>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000000,
                    padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem',
                    background: toast.type === 'error' ? '#EF4444' : '#10B981', color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    animation: 'modalSlideUp 0.3s ease-out', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {toast.type === 'error' ? <LuTriangleAlert size={18} /> : <LuCheck size={18} />}
                    {toast.msg}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, id: null, action: '' })}
                onConfirm={handleRespond}
                title={confirmModal.action === 'approved' ? 'Approve Request' : 'Reject Request'}
                message={`Are you sure you want to ${confirmModal.action} this unlock request?`}
                confirmText={confirmModal.action === 'approved' ? 'Approve' : 'Reject'}
                confirmButtonClass={confirmModal.action === 'approved' ? 'btn-success' : 'btn-danger'}
            />

            <style>{`
                .loader {
                    border: 3px solid var(--border-color);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                tr:hover { background: var(--sidebar-bg); transition: background 0.2s; }
            `}</style>
        </div>
    );
}
