import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaUserCheck, FaUserTimes, FaHourglassHalf, FaSearch, FaFilter, FaTimes as FaClose, FaIdCard, FaChevronDown } from 'react-icons/fa';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { CONFIG } from '../config';

export default function Verifications() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVerification, setSelectedVerification] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [currentIDPart, setCurrentIDPart] = useState(0);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: '', message: '', userId: null });
    const [blockingReason, setBlockingReason] = useState('');

    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        fetchVerifications(1);
    }, [searchTerm, activeTab, sortBy, sortDir]);

    const fetchVerifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/verifications', {
                params: {
                    page,
                    search: searchTerm,
                    status: activeTab,
                    sort_by: sortBy,
                    sort_dir: sortDir
                }
            });
            setVerifications(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchVerifications(page);
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/verifications/${id}/approve`);
            setSelectedVerification(null);
            fetchVerifications(currentPage);
        } catch (error) {
            showToast('Failed to approve', 'error');
        }
    };

    const handleReject = async (id, reason) => {
        if (!reason.trim()) {
            showToast('Please provide a reason for rejection', 'error');
            return;
        }
        try {
            await api.post(`/admin/verifications/${id}/reject`, { reason });
            setSelectedVerification(null);
            setRejectReason('');
            fetchVerifications(currentPage);
        } catch (error) {
            showToast('Failed to reject', 'error');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified': return <span className="badge badge-verified">VERIFIED</span>;
            case 'rejected': return <span className="badge badge-rejected">REJECTED</span>;
            default: return <span className="badge badge-warning">PENDING</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const activeFilterCount = sortBy !== 'created_at' || sortDir !== 'desc' ? 1 : 0;

    return (
        <div className="verifications-page">
            <style>{`
                .verifications-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .verifications-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .verifications-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .verifications-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .verifications-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .verifications-page .um-filter-toggle {
                    display: none;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1.5px solid var(--border-color);
                    background: var(--card-bg);
                    color: var(--text);
                    border-radius: 10px;
                    padding: 0.55rem 0.9rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .verifications-page .um-filter-badge {
                    background: var(--primary);
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.68rem;
                    min-width: 18px;
                    height: 18px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 5px;
                }
                .verifications-page .um-cards { display: none; }
                .verifications-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .verifications-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .verifications-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .verifications-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .verifications-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .verifications-page .um-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .verifications-page .um-card-actions .btn {
                    flex: 1 1 auto;
                    justify-content: center;
                    padding: 0.55rem 0.75rem;
                }
                .verifications-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .verifications-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .verifications-page .um-skel-row {
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
                .verifications-page .um-filter-drawer {
                    display: none;
                }
                @media (max-width: 768px) {
                    .verifications-page .um-table-wrap { display: none; }
                    .verifications-page .um-cards { display: block; }
                    .verifications-page .um-filter-toggle { display: inline-flex; }
                    .verifications-page .filter-bar { display: none; }
                    .verifications-page .um-card-grid { grid-template-columns: 1fr; }
                    .verifications-page .um-filter-drawer.open {
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--hover-bg);
                    }
                    .verifications-page .um-filter-drawer select {
                        width: 100%;
                        appearance: none;
                        -webkit-appearance: none;
                        background-color: var(--card-bg);
                        color: var(--text);
                        border: 1.5px solid var(--border-color);
                        border-radius: 10px;
                        padding: 0.7rem 2.25rem 0.7rem 0.9rem;
                        font-size: 0.85rem;
                        font-weight: 500;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-position: right 0.85rem center;
                        background-size: 1.1rem;
                    }
                    .verifications-page .um-filter-drawer select:focus {
                        outline: none;
                        border-color: var(--primary);
                        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18);
                    }
                    .verifications-page .um-search-row .tabs-scroll { width: 100%; }
                }
                @media (min-width: 769px) {
                    .verifications-page .um-filter-drawer { display: none !important; }
                }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem' }}><FaIdCard /></div>
                            <div>
                                <h2 style={{ margin: 0 }}>ID Verifications</h2>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review and process identity verification submissions</p>
                            </div>
                        </div>
                    </div>

                    <div className="um-search-row">
                        <div className="tabs-scroll" style={{ flex: '1 1 auto', marginBottom: 0 }}>
                            <button style={{ padding: '0.6rem 1rem', border: 'none', background: activeTab === 'pending' ? 'var(--primary)' : 'transparent', color: activeTab === 'pending' ? 'white' : 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                onClick={() => setActiveTab('pending')}><FaHourglassHalf /> Pending</button>
                            <button style={{ padding: '0.6rem 1rem', border: 'none', background: activeTab === 'verified' ? 'var(--primary)' : 'transparent', color: activeTab === 'verified' ? 'white' : 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                onClick={() => setActiveTab('verified')}><FaUserCheck /> Approved</button>
                            <button style={{ padding: '0.6rem 1rem', border: 'none', background: activeTab === 'rejected' ? 'var(--primary)' : 'transparent', color: activeTab === 'rejected' ? 'white' : 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                onClick={() => setActiveTab('rejected')}><FaUserTimes /> Rejected</button>
                        </div>
                        <div className="um-search-wrap" style={{ maxWidth: '260px' }}>
                            <FaSearch />
                            <input type="text" placeholder="Search by name, email, matrimony ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <button type="button" className="um-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
                            {filtersOpen ? <FaTimes /> : <FaFilter />}
                            Sort
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        <select value={`${sortBy}-${sortDir}`} onChange={(e) => { const [by, dir] = e.target.value.split('-'); setSortBy(by); setSortDir(dir); }}>
                            <option value="created_at-desc">Sort: Newest</option>
                            <option value="created_at-asc">Sort: Oldest</option>
                            <option value="updated_at-desc">Sort: Last Updated</option>
                            <option value="name-asc">Sort: Name (A-Z)</option>
                            <option value="name-desc">Sort: Name (Z-A)</option>
                        </select>
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <select value={`${sortBy}-${sortDir}`} onChange={(e) => { const [by, dir] = e.target.value.split('-'); setSortBy(by); setSortDir(dir); }} style={{ fontWeight: '500' }}>
                            <option value="created_at-desc">Sort: Newest</option>
                            <option value="created_at-asc">Sort: Oldest</option>
                            <option value="updated_at-desc">Sort: Last Updated</option>
                            <option value="name-asc">Sort: Name (A-Z)</option>
                            <option value="name-desc">Sort: Name (Z-A)</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="um-empty">
                        <FaIdCard />
                        <p style={{ margin: 0, fontWeight: 600 }}>No verifications found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{searchTerm ? 'No matching verifications found.' : `No ${activeTab} verifications found.`}</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>ID Type</th>
                                            <th>ID Number</th>
                                            <th>Status</th>
                                            <th>{activeTab === 'pending' ? 'Submitted At' : 'Processed At'}</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {verifications.map((v) => (
                                            <tr key={v.id}>
                                                <td><UserCell user={v.user} profile={v.user?.user_profile} /></td>
                                                <td>{v.id_proof_type}</td>
                                                <td>{v.id_proof_number || 'N/A'}</td>
                                                <td>{getStatusBadge(v.status)}</td>
                                                <td>{formatDate(v.verified_at || v.created_at)}</td>
                                                <td>
                                                    <button onClick={() => { setSelectedVerification(v); setRejectReason(v.rejection_reason || ''); }} className="btn btn-primary">
                                                        {activeTab === 'pending' ? 'Review & Process' : 'View Details'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {verifications.map((v) => (
                                <div className="um-card" key={v.id}>
                                    <div className="um-card-top">
                                        <UserCell user={v.user} profile={v.user?.user_profile} />
                                        {getStatusBadge(v.status)}
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>ID Type</dt>
                                            <dd>{v.id_proof_type}</dd>
                                        </div>
                                        <div>
                                            <dt>ID Number</dt>
                                            <dd>{v.id_proof_number || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt>{activeTab === 'pending' ? 'Submitted At' : 'Processed At'}</dt>
                                            <dd style={{ fontSize: '0.75rem' }}>{formatDate(v.verified_at || v.created_at)}</dd>
                                        </div>
                                    </dl>
                                    <div className="um-card-actions">
                                        <button onClick={() => { setSelectedVerification(v); setRejectReason(v.rejection_reason || ''); }} className="btn btn-primary">
                                            {activeTab === 'pending' ? 'Review & Process' : 'View Details'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalItems} itemsPerPage={15} />
                    </>
                )}
            </div>

            {selectedVerification && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '2rem'
                }} onClick={() => setSelectedVerification(null)}>
                    <div className="modal-content" style={{
                        backgroundColor: 'var(--card-bg)', width: '100%', maxWidth: '1000px',
                        maxHeight: '90vh', borderRadius: '1rem', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid var(--border-color)',
                        overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-color)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <h3 style={{ margin: 0 }}>Reviewing Verification</h3>
                            <button onClick={() => setSelectedVerification(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.25rem' }}>
                                <FaTimes />
                            </button>
                        </div>
                        <div style={{ padding: '2rem', overflowY: 'auto' }}>
                            <div className="responsive-detail" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>User Profile Info</h4>
                                    <div className="profile-info-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        {selectedVerification.user?.user_profile?.profile_picture ? (
                                            <img src={selectedVerification.user.user_profile.profile_picture.startsWith('http') ? selectedVerification.user.user_profile.profile_picture : `${CONFIG.BASE_URL}${selectedVerification.user.user_profile.profile_picture}`}
                                                alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                                        ) : <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No Image</div>}
                                        <div>
                                            <p style={{ margin: '0 0 0.25rem', fontWeight: '600', fontSize: '1.1rem' }}>
                                                {selectedVerification.user?.user_profile?.first_name} {selectedVerification.user?.user_profile?.last_name}
                                            </p>
                                            <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selectedVerification.user?.email}</p>
                                            <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                                                ID: {selectedVerification.user?.matrimony_id}
                                            </div>
                                            <div style={{ marginTop: '1rem' }}>
                                                <button
                                                    className={`btn ${selectedVerification.user?.status === 'blocked' ? 'btn-success' : 'btn-danger'}`}
                                                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                    onClick={() => {
                                                        const user = selectedVerification.user;
                                                        const isBlocked = user?.status === 'blocked';
                                                        setBlockingReason('');
                                                        setConfirmModal({
                                                            isOpen: true, userId: user?.id, action: 'toggleBlock',
                                                            message: isBlocked ? `Unblock ${user?.user_profile?.first_name}?` : `Block ${user?.user_profile?.first_name}? Please provide a reason:`,
                                                            isBlocked
                                                        });
                                                    }}
                                                >
                                                    {selectedVerification.user?.status === 'blocked' ? <FaUserCheck /> : <FaUserTimes />}
                                                    {selectedVerification.user?.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>User Photos</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.75rem' }}>
                                        {selectedVerification.user?.user_profile?.profile_picture && (
                                            <div style={{ position: 'relative' }}>
                                                <img src={selectedVerification.user.user_profile.profile_picture.startsWith('http') ? selectedVerification.user.user_profile.profile_picture : `${CONFIG.BASE_URL}${selectedVerification.user.user_profile.profile_picture}`}
                                                    alt="Primary" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--primary)' }}
                                                    onClick={() => setZoomedImage(selectedVerification.user.user_profile.profile_picture.startsWith('http') ? selectedVerification.user.user_profile.profile_picture : `${CONFIG.BASE_URL}${selectedVerification.user.user_profile.profile_picture}`)} />
                                                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--primary)', color: 'white', fontSize: '0.6rem', textAlign: 'center', fontWeight: 'bold' }}>PRIMARY</span>
                                            </div>
                                        )}
                                        {selectedVerification.user?.profile_photos?.filter(photo => {
                                            const primaryUrl = selectedVerification.user.user_profile.profile_picture;
                                            if (!primaryUrl) return true;
                                            return !photo.photo_url.includes(primaryUrl) && !primaryUrl.includes(photo.photo_url);
                                        }).map((photo) => (
                                            <img key={photo.id} src={photo.full_photo_url} alt="Gallery"
                                                style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                                                onClick={() => setZoomedImage(photo.full_photo_url)} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Submitted ID Documents</h4>
                                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                        <div className="grid-2">
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Proof Type</span>
                                                <p style={{ margin: 0, fontWeight: '600' }}>{selectedVerification.id_proof_type}</p>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ID Number</span>
                                                <p style={{ margin: 0, fontWeight: '600' }}>{selectedVerification.id_proof_number || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="id-image-viewer" style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div className="id-image-container" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {currentIDPart === 0 ? (
                                                <img src={selectedVerification.id_proof_front_url?.startsWith('http') ? selectedVerification.id_proof_front_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_front_url}`}
                                                    alt="ID Front" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
                                                    onClick={() => setZoomedImage(selectedVerification.id_proof_front_url?.startsWith('http') ? selectedVerification.id_proof_front_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_front_url}`)} />
                                            ) : (
                                                <img src={selectedVerification.id_proof_back_url?.startsWith('http') ? selectedVerification.id_proof_back_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_back_url}`}
                                                    alt="ID Back" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
                                                    onClick={() => setZoomedImage(selectedVerification.id_proof_back_url?.startsWith('http') ? selectedVerification.id_proof_back_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_back_url}`)} />
                                            )}
                                        </div>
                                        {selectedVerification.id_proof_back_url && (
                                            <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
                                                <button onClick={() => setCurrentIDPart(0)}
                                                    style={{ flex: 1, padding: '0.75rem', border: 'none', background: currentIDPart === 0 ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Front Side</button>
                                                <button onClick={() => setCurrentIDPart(1)}
                                                    style={{ flex: 1, padding: '0.75rem', border: 'none', background: currentIDPart === 1 ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Back Side</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                    {selectedVerification.status === 'pending' ? 'Decision Process' : 'Decision Status'}
                                </h4>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem' }}>
                                    {selectedVerification.status === 'pending' ? (
                                        <>
                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>If rejecting, please state the reason:</p>
                                            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                                placeholder="Enter rejection reason here..."
                                                style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'var(--text)', fontSize: '0.875rem', resize: 'vertical', outline: 'none' }} />
                                            <div className="btn-group-end" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                                <button className="btn btn-danger" style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                                                    onClick={() => handleReject(selectedVerification.id, rejectReason)}>Reject Submission</button>
                                                <button className="btn btn-success" style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                                                    onClick={() => handleApprove(selectedVerification.id)}>Approve & Mark Verified</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <p style={{ margin: 0 }}>This verification is already <b>{selectedVerification.status.toUpperCase()}</b>.</p>
                                            {selectedVerification.rejection_reason && (
                                                <p style={{ marginTop: '0.5rem', color: '#ef4444' }}>Reason: {selectedVerification.rejection_reason}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {zoomedImage && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                    onClick={() => setZoomedImage(null)}>
                    <button onClick={() => setZoomedImage(null)}
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <FaClose />
                    </button>
                    <img src={zoomedImage} alt="Zoomed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
                        onClick={e => e.stopPropagation()} />
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, action: '', message: '', userId: null })}
                onConfirm={async () => {
                    try {
                        await api.post(`/admin/users/${confirmModal.userId}/toggle-block`, { block_reason: blockingReason || undefined });
                        fetchVerifications(currentPage);
                        if (selectedVerification?.user?.id === confirmModal.userId) {
                            setSelectedVerification(prev => ({ ...prev, user: { ...prev.user, status: prev.user.status === 'active' ? 'blocked' : 'active' } }));
                        }
                    } catch (error) {
                        showToast('Action failed', 'error');
                    } finally {
                        setConfirmModal({ isOpen: false, id: null, action: '', message: '', userId: null });
                    }
                }}
                title="Confirm Action"
                message={confirmModal.message}
                confirmButtonClass={confirmModal.isBlocked ? 'btn-success' : 'btn-danger'}
                showInput={confirmModal.action === 'toggleBlock' && !confirmModal.isBlocked}
                inputPlaceholder="Reason for blocking..."
                inputValue={blockingReason}
                onInputChange={setBlockingReason}
            />
            {ToastComponent}
        </div>
    );
}