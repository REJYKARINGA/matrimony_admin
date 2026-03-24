import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaTimes as FaClose, FaUserCheck, FaUserTimes, FaHourglassHalf } from 'react-icons/fa';
import Pagination from '../components/Pagination';
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
    const [currentIDPart, setCurrentIDPart] = useState(0); // 0: Front, 1: Back
    const [zoomedImage, setZoomedImage] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); // pending, verified, rejected

    useEffect(() => {
        fetchVerifications(1);
    }, [searchTerm, activeTab]);

    const fetchVerifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/verifications', {
                params: { 
                    page,
                    search: searchTerm,
                    status: activeTab
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
            alert('Failed to approve');
        }
    };

    const handleReject = async (id, reason) => {
        if (!reason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        try {
            await api.post(`/admin/verifications/${id}/reject`, { reason });
            setSelectedVerification(null);
            setRejectReason('');
            fetchVerifications(currentPage);
        } catch (error) {
            alert('Failed to reject');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified': return <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>VERIFIED</span>;
            case 'rejected': return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>REJECTED</span>;
            default: return <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PENDING</span>;
        }
    };

    return (
        <>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>ID Verifications</h2>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name, email, matrimony ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-color)',
                                minWidth: '300px',
                                outline: 'none',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div style={tabContainerStyle}>
                    <button 
                        style={activeTab === 'pending' ? activeTabStyle : tabStyle} 
                        onClick={() => setActiveTab('pending')}
                    >
                        <FaHourglassHalf style={{ marginRight: '0.5rem' }} />
                        Pending
                    </button>
                    <button 
                        style={activeTab === 'verified' ? activeTabStyle : tabStyle} 
                        onClick={() => setActiveTab('verified')}
                    >
                        <FaUserCheck style={{ marginRight: '0.5rem' }} />
                        Approved
                    </button>
                    <button 
                        style={activeTab === 'rejected' ? activeTabStyle : tabStyle} 
                        onClick={() => setActiveTab('rejected')}
                    >
                        <FaUserTimes style={{ marginRight: '0.5rem' }} />
                        Rejected
                    </button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : verifications.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {searchTerm ? 'No matching verifications found.' : `No ${activeTab} verifications found.`}
                    </p>
                ) : (
                    <>
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
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>
                                                        {v.user?.user_profile?.first_name} {v.user?.user_profile?.last_name}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{v.user?.email}</div>
                                                </div>
                                            </td>
                                            <td>{v.id_proof_type}</td>
                                            <td>{v.id_proof_number || 'N/A'}</td>
                                            <td>{getStatusBadge(v.status)}</td>
                                            <td>{new Date(v.verified_at || v.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedVerification(v);
                                                        setRejectReason(v.rejection_reason || '');
                                                    }} 
                                                    className="btn btn-primary"
                                                >
                                                    {activeTab === 'pending' ? 'Review & Process' : 'View Details'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalItems}
                            itemsPerPage={15}
                        />
                    </>
                )}
            </div>

            {/* Verification Detail Modal */}
            {selectedVerification && (
                <div style={modalOverlayStyle} onClick={() => setSelectedVerification(null)}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0 }}>Reviewing Verification</h3>
                            <button 
                                onClick={() => setSelectedVerification(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.25rem' }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div style={modalBodyStyle}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '2rem' }}>
                                {/* Left Side: User Info & Gallery */}
                                <div>
                                    <h4 style={sectionTitleStyle}>User Profile Info</h4>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        {selectedVerification.user?.user_profile?.profile_picture ? (
                                            <img
                                                src={selectedVerification.user.user_profile.profile_picture.startsWith('http') ? selectedVerification.user.user_profile.profile_picture : `${CONFIG.BASE_URL}${selectedVerification.user.user_profile.profile_picture}`}
                                                alt="Profile"
                                                style={profileImageStyle}
                                            />
                                        ) : <div style={profileImagePlaceholderStyle}>No Image</div>}
                                        <div>
                                            <p style={{ margin: '0 0 0.25rem', fontWeight: '600', fontSize: '1.1rem' }}>
                                                {selectedVerification.user?.user_profile?.first_name} {selectedVerification.user?.user_profile?.last_name}
                                            </p>
                                            <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selectedVerification.user?.email}</p>
                                            <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                                                ID: {selectedVerification.user?.matrimony_id}
                                            </div>
                                        </div>
                                    </div>

                                    <h4 style={sectionTitleStyle}>User Photos</h4>
                                    <div style={photoGridStyle}>
                                        {/* Primary Photo First */}
                                        {selectedVerification.user?.user_profile?.profile_picture && (
                                            <div style={{ position: 'relative' }}>
                                                <img
                                                    src={selectedVerification.user.user_profile.profile_picture.startsWith('http') ? selectedVerification.user.user_profile.profile_picture : `${CONFIG.BASE_URL}${selectedVerification.user.user_profile.profile_picture}`}
                                                    alt="Primary"
                                                    style={{ ...galleryImageStyle, border: '2px solid var(--primary)' }}
                                                    onClick={() => setZoomedImage(selectedVerification.user.user_profile.profile_picture.startsWith('http') ? selectedVerification.user.user_profile.profile_picture : `${CONFIG.BASE_URL}${selectedVerification.user.user_profile.profile_picture}`)}
                                                />
                                                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--primary)', color: 'white', fontSize: '0.6rem', textAlign: 'center', fontWeight: 'bold' }}>PRIMARY</span>
                                            </div>
                                        )}
                                        
                                        {/* Gallery Photos (Filter out the primary if it's repeated) */}
                                        {selectedVerification.user?.profile_photos?.filter(photo => {
                                            const primaryUrl = selectedVerification.user.user_profile.profile_picture;
                                            if (!primaryUrl) return true;
                                            return !photo.photo_url.includes(primaryUrl) && !primaryUrl.includes(photo.photo_url);
                                        }).map((photo) => (
                                            <img 
                                                key={photo.id} 
                                                src={photo.full_photo_url} 
                                                alt="Gallery" 
                                                style={galleryImageStyle}
                                                onClick={() => setZoomedImage(photo.full_photo_url)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: ID Documents */}
                                <div>
                                    <h4 style={sectionTitleStyle}>Submitted ID Documents</h4>
                                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                    
                                    <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {currentIDPart === 0 ? (
                                                <img 
                                                    src={selectedVerification.id_proof_front_url?.startsWith('http') ? selectedVerification.id_proof_front_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_front_url}`}
                                                    alt="ID Front"
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
                                                    onClick={() => setZoomedImage(selectedVerification.id_proof_front_url?.startsWith('http') ? selectedVerification.id_proof_front_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_front_url}`)}
                                                />
                                            ) : (
                                                <img 
                                                    src={selectedVerification.id_proof_back_url?.startsWith('http') ? selectedVerification.id_proof_back_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_back_url}`}
                                                    alt="ID Back"
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
                                                    onClick={() => setZoomedImage(selectedVerification.id_proof_back_url?.startsWith('http') ? selectedVerification.id_proof_back_url : `${CONFIG.BASE_URL}${selectedVerification.id_proof_back_url}`)}
                                                />
                                            )}
                                        </div>

                                        {selectedVerification.id_proof_back_url && (
                                            <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
                                                <button 
                                                    onClick={() => setCurrentIDPart(0)}
                                                    style={{ 
                                                        flex: 1, padding: '0.75rem', border: 'none', background: currentIDPart === 0 ? 'var(--primary)' : 'transparent',
                                                        color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                                                    }}
                                                >
                                                    Front Side
                                                </button>
                                                <button 
                                                    onClick={() => setCurrentIDPart(1)}
                                                    style={{ 
                                                        flex: 1, padding: '0.75rem', border: 'none', background: currentIDPart === 1 ? 'var(--primary)' : 'transparent',
                                                        color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                                                    }}
                                                >
                                                    Back Side
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={sectionTitleStyle}>{selectedVerification.status === 'pending' ? 'Decision Process' : 'Decision Status'}</h4>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem' }}>
                                    {selectedVerification.status === 'pending' ? (
                                        <>
                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>If rejecting, please state the reason (e.g., "ID photo is blurry", "ID expired"):</p>
                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                placeholder="Enter rejection reason here..."
                                                style={textareaStyle}
                                            />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                                <button 
                                                    className="btn btn-danger" 
                                                    style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                                                    onClick={() => handleReject(selectedVerification.id, rejectReason)}
                                                >
                                                    Reject Submission
                                                </button>
                                                <button 
                                                    className="btn btn-success" 
                                                    style={{ padding: '0.75rem 1.5rem', fontWeight: '600' }}
                                                    onClick={() => handleApprove(selectedVerification.id)}
                                                >
                                                    Approve & Mark Verified
                                                </button>
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

            {/* Zoomed Image Modal */}
            {zoomedImage && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                    onClick={() => setZoomedImage(null)}
                >
                    <button 
                        onClick={() => setZoomedImage(null)}
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}
                    >
                        <FaClose />
                    </button>
                    <img 
                        src={zoomedImage} 
                        alt="Zoomed" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

// Tab Styles
const tabContainerStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem'
};

const tabStyle = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
};

const activeTabStyle = {
    ...tabStyle,
    background: 'var(--primary)',
    color: '#fff'
};

// Modal Styles
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem'
};

const modalContentStyle = {
    backgroundColor: 'var(--card-bg)',
    width: '100%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    borderRadius: '1rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden'
};

const modalHeaderStyle = {
    padding: '1.25rem 2rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.02)'
};

const modalBodyStyle = {
    padding: '2rem',
    overflowY: 'auto'
};

const sectionTitleStyle = {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--primary)',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.5rem'
};

const profileImageStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '2px solid var(--border-color)'
};

const profileImagePlaceholderStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
};

const photoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
    gap: '0.75rem'
};

const galleryImageStyle = {
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '8px',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    transition: 'transform 0.2s'
};

const idDocumentImageStyle = {
    width: '100%',
    maxHeight: '250px',
    borderRadius: '8px',
    objectFit: 'contain',
    background: '#000',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    padding: '4px'
};

const imageLabelStyle = {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
    fontWeight: '600'
};

const textareaStyle = {
    width: '100%',
    minHeight: '80px',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
    color: 'var(--text)',
    fontSize: '0.875rem',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s'
};
