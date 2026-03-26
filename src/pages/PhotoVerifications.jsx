import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheck, FaTimes, FaTimes as FaClose, FaUserCheck, FaUserTimes, FaHourglassHalf, FaEye, FaImages } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { CONFIG } from '../config';

export default function PhotoVerifications() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); // pending, verified, rejected
    const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Custom confirmation modal state
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        confirmButtonClass: 'btn-primary',
        onConfirm: () => {}
    });

    useEffect(() => {
        fetchUsers(1);
    }, [searchTerm, activeTab]);

    // Reset selection when switching users or tabs
    useEffect(() => {
        setSelectedPhotoIds([]);
    }, [selectedUser, activeTab]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/profile-photos', {
                params: { 
                    page,
                    search: searchTerm,
                    status: activeTab
                }
            });
            const fetchedUsers = response.data.data;
            setUsers(fetchedUsers);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);

            // Sync modal data if it's open
            if (selectedUser) {
                const updatedUser = fetchedUsers.find(u => u.id === selectedUser.id);
                if (updatedUser) {
                    setSelectedUser(updatedUser);
                } else {
                    // User no longer has photos matching this tab's criteria
                    setSelectedUser(null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchUsers(page);
    };

    const showConfirm = (config) => {
        setRejectionReason(''); // Reset reason
        setConfirmConfig({
            isOpen: true,
            title: config.title || 'Confirm Action',
            message: config.message || 'Are you sure you want to proceed?',
            confirmText: config.confirmText || 'Confirm',
            confirmButtonClass: config.confirmButtonClass || 'btn-primary',
            showInput: config.showInput || false,
            inputPlaceholder: config.inputPlaceholder || 'Enter reason...',
            onConfirm: (val) => {
                config.onConfirm(val);
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleApprove = async (photoId) => {
        try {
            await api.post(`/admin/profile-photos/${photoId}/verify`);
            fetchUsers(currentPage);
        } catch (error) {
            alert('Failed to approve photo');
        }
    };

    const handleReject = async (photoId) => {
        showConfirm({
            title: 'Reject Photo',
            message: 'Please provide a reason for rejecting this photo. This helps the user understand what went wrong.',
            confirmText: 'Reject Photo',
            confirmButtonClass: 'btn-danger',
            showInput: true,
            inputPlaceholder: 'e.g. Low quality, Inappropriate content, Not a face...',
            onConfirm: async (reason) => {
                try {
                    await api.post(`/admin/profile-photos/${photoId}/reject`, { reason });
                    fetchUsers(currentPage);
                } catch (error) {
                    alert('Failed to reject photo');
                }
            }
        });
    };

    const togglePhotoSelection = (photoId) => {
        setSelectedPhotoIds(prev => 
            prev.includes(photoId) 
                ? prev.filter(id => id !== photoId) 
                : [...prev, photoId]
        );
    };

    const handleBulkAction = async (action) => {
        if (selectedPhotoIds.length === 0) return;
        
        const isApprove = action === 'approve';
        showConfirm({
            title: isApprove ? 'Bulk Approve' : 'Bulk Reject',
            message: isApprove 
                ? `Are you sure you want to approve ${selectedPhotoIds.length} selected photos?`
                : `Please provide a reason for rejecting ${selectedPhotoIds.length} photos.`,
            confirmText: isApprove ? 'Approve Selected' : 'Reject Selected',
            confirmButtonClass: isApprove ? 'btn-success' : 'btn-danger',
            showInput: !isApprove,
            inputPlaceholder: 'Reason for rejection...',
            onConfirm: async (reason) => {
                try {
                    setIsBulkProcessing(true);
                    const endpoint = isApprove ? 'verify' : 'reject';
                    const data = isApprove ? {} : { reason };
                    const promises = selectedPhotoIds.map(id => api.post(`/admin/profile-photos/${id}/${endpoint}`, data));
                    await Promise.all(promises);
                    setSelectedPhotoIds([]);
                    fetchUsers(currentPage);
                } catch (error) {
                    alert(`Failed to bulk ${action} photos`);
                } finally {
                    setIsBulkProcessing(false);
                }
            }
        });
    };

    const handleApproveAll = async (user) => {
        showConfirm({
            title: 'Approve All Photos',
            message: `Are you sure you want to approve all ${user.profile_photos.length} photos for this user?`,
            confirmText: 'Approve All',
            confirmButtonClass: 'btn-success',
            onConfirm: async () => {
                try {
                    setIsBulkProcessing(true);
                    const promises = user.profile_photos.map(p => api.post(`/admin/profile-photos/${p.id}/verify`));
                    await Promise.all(promises);
                    setSelectedUser(null);
                    fetchUsers(currentPage);
                } catch (error) {
                    alert('Failed to approve all photos');
                } finally {
                    setIsBulkProcessing(false);
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified': return <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>APPROVED</span>;
            case 'rejected': return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>REJECTED</span>;
            default: return <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PENDING</span>;
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Photo Verifications</h2>
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
                        Pending Requests
                    </button>
                    <button 
                        style={activeTab === 'verified' ? activeTabStyle : tabStyle} 
                        onClick={() => setActiveTab('verified')}
                    >
                        <FaUserCheck style={{ marginRight: '0.5rem' }} />
                        Verified
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
                ) : users.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {searchTerm ? 'No matching users found.' : `No ${activeTab} photo requests found.`}
                    </p>
                ) : (
                    <>
                        <div style={userGridStyle}>
                            {users.map((user) => (
                                <div key={user.id} style={userCardStyle} onClick={() => setSelectedUser(user)}>
                                    <div style={stackedImagesStyle}>
                                        {user.profile_photos?.slice(0, 3).map((photo, index) => (
                                            <div key={photo.id} style={stackedImageWrapperStyle(index)}>
                                                <img
                                                    src={photo.full_photo_url}
                                                    alt="User upload"
                                                    style={photoImageStyle}
                                                />
                                                {index === 0 && user.profile_photos.length > 1 && (
                                                    <div style={countBadgeStyle}>
                                                        <FaImages style={{ marginRight: '4px' }} />
                                                        {user.profile_photos.length}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={userInfoStyle}>
                                        <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.2rem' }}>
                                            {user.user_profile?.first_name} {user.user_profile?.last_name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                            {user.matrimony_id}
                                        </div>
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                {user.profile_photos?.length} PENDING {user.profile_photos?.length === 1 ? 'PHOTO' : 'PHOTOS'}
                                            </span>
                                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalItems}
                            itemsPerPage={12}
                        />
                    </>
                )}
            </div>

            {/* Photo Detail Modal */}
            {selectedUser && (
                <div style={modalOverlayStyle} onClick={() => !isBulkProcessing && setSelectedUser(null)}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0 }}>Review User Photos - {selectedUser.user_profile?.first_name}</h3>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.25rem' }}
                                disabled={isBulkProcessing}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div style={modalBodyStyle}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: selectedUser.profile_photos?.length === 1 ? 'minmax(300px, 450px) 1fr' : '1fr 300px', 
                                gap: '2rem',
                                justifyContent: 'start'
                            }}>
                                {/* Left Side: Photo List */}
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: selectedUser.profile_photos?.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', 
                                    gap: '1.5rem', 
                                    maxHeight: '70vh', 
                                    overflowY: 'auto', 
                                    paddingRight: '1rem' 
                                }}>
                                    {selectedUser.profile_photos?.map((photo) => (
                                        <div key={photo.id} style={{ 
                                            background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '16px', 
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            width: '100%',
                                            position: 'relative'
                                        }}>
                                            {/* Selection Checkbox */}
                                            {activeTab === 'pending' && (
                                                <div 
                                                    style={{ 
                                                        position: 'absolute', 
                                                        top: '12px', 
                                                        left: '12px', 
                                                        zIndex: 20,
                                                        background: 'rgba(0,0,0,0.5)',
                                                        borderRadius: '4px',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backdropFilter: 'blur(4px)',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        togglePhotoSelection(photo.id);
                                                    }}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedPhotoIds.includes(photo.id)}
                                                        onChange={() => {}} // Handled by div onClick
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            )}

                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                                                <img 
                                                    src={photo.full_photo_url} 
                                                    alt="Review" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                    onClick={() => setZoomedImage(photo.full_photo_url)}
                                                />
                                                {photo.is_primary && <span style={primaryBadgeStyle}>PRIMARY</span>}
                                            </div>
                                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                                                {/* Status Display for Moderated Photos */}
                                                {activeTab !== 'pending' && (
                                                    <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.25rem' }}>
                                                        {getStatusBadge(activeTab)}
                                                        {activeTab === 'rejected' && photo.rejection_reason && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '0.4rem 0.5rem 0' }}>
                                                                "{photo.rejection_reason}"
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                    {(activeTab === 'pending' || activeTab === 'rejected') && (
                                                        <button 
                                                            className="btn btn-success" 
                                                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', fontWeight: '800' }}
                                                            onClick={(e) => { e.stopPropagation(); handleApprove(photo.id); }}
                                                            disabled={isBulkProcessing}
                                                        >
                                                            {activeTab === 'rejected' ? 'APPROVE INSTEAD' : 'APPROVE'}
                                                        </button>
                                                    )}
                                                    {(activeTab === 'pending' || activeTab === 'verified' || activeTab === 'rejected') && (
                                                        <button 
                                                            className="btn btn-danger" 
                                                            style={{ flex: 1, padding: '0.6rem', fontSize: '0.75rem', fontWeight: '800' }}
                                                            onClick={(e) => { e.stopPropagation(); handleReject(photo.id); }}
                                                            disabled={isBulkProcessing}
                                                        >
                                                            {activeTab === 'verified' ? 'REJECT INSTEAD' : (activeTab === 'rejected' ? 'UPDATE REASON' : 'REJECT')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Side: User Details */}
                                <div style={{ maxWidth: '400px' }}>
                                    <h4 style={sectionTitleStyle}>User Information</h4>
                                    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FULL NAME</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedUser.user_profile?.first_name} {selectedUser.user_profile?.last_name}</p>
                                        </div>
                                        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>EMAIL ADDRESS</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedUser.email}</p>
                                        </div>
                                        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MATRIMONY ID</p>
                                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary)' }}>{selectedUser.matrimony_id}</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PHONE NUMBER</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedUser.phone}</p>
                                        </div>
                                    </div>

                                    {activeTab === 'pending' && selectedUser.approved_profile_photos && selectedUser.approved_profile_photos.length > 0 && (
                                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Previously Approved Photos
                                            </h4>
                                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--primary)' }}>
                                                Use these to verify identity
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                                {selectedUser.approved_profile_photos.map(photo => (
                                                    <div key={photo.id} style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                                                        <img 
                                                            src={photo.full_photo_url} 
                                                            alt="Approved" 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(34, 197, 94, 0.4)' }}
                                                            onClick={(e) => { e.stopPropagation(); setZoomedImage(photo.full_photo_url); }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'pending' && (
                                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedPhotoIds.length > 0 ? (
                                                <>
                                                    <div style={{ background: 'rgba(21, 101, 192, 0.1)', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                            {selectedPhotoIds.length} Photos Selected
                                                        </p>
                                                    </div>
                                                    <button 
                                                        className="btn btn-success" 
                                                        style={{ width: '100%', padding: '1rem', fontWeight: 'bold', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}
                                                        onClick={() => handleBulkAction('approve')}
                                                        disabled={isBulkProcessing}
                                                    >
                                                        Approve Selected ({selectedPhotoIds.length})
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger" 
                                                        style={{ width: '100%', padding: '1rem', fontWeight: 'bold', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
                                                        onClick={() => handleBulkAction('reject')}
                                                        disabled={isBulkProcessing}
                                                    >
                                                        Reject Selected ({selectedPhotoIds.length})
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="btn btn-success" 
                                                    style={{ width: '100%', padding: '1rem', fontWeight: 'bold', borderRadius: '0.75rem', opacity: 0.8 }}
                                                    onClick={() => handleApproveAll(selectedUser)}
                                                    disabled={isBulkProcessing}
                                                >
                                                    Approve All Pending ({selectedUser.profile_photos?.length})
                                                </button>
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
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                confirmButtonClass={confirmConfig.confirmButtonClass}
                showInput={confirmConfig.showInput}
                inputPlaceholder={confirmConfig.inputPlaceholder}
                inputValue={rejectionReason}
                onInputChange={setRejectionReason}
            />
        </div>
    );
}

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

const userGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
};

const userCardStyle = {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    transition: 'all 0.3s',
    cursor: 'pointer',
    position: 'relative'
};

const stackedImagesStyle = {
    position: 'relative',
    height: '350px',
    margin: '20px'
};

const stackedImageWrapperStyle = (index) => ({
    position: 'absolute',
    top: `${index * 8}px`,
    left: `${index * 8}px`,
    width: `calc(100% - ${index * 16}px)`,
    height: `calc(100% - ${index * 16}px)`,
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid var(--border-color)',
    zIndex: 10 - index,
    boxShadow: index === 0 ? '0 10px 15px -3px rgba(0, 0, 0, 0.2)' : 'none'
});

const photoImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
};

const countBadgeStyle = {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    backdropFilter: 'blur(4px)'
};

const userInfoStyle = {
    padding: '0 1.25rem 1.25rem'
};

const primaryBadgeStyle = {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    background: 'var(--primary)',
    color: 'white',
    fontSize: '0.65rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontWeight: 'bold',
    zIndex: 10
};

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
    maxWidth: '1100px',
    maxHeight: '90vh',
    borderRadius: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
};

const modalHeaderStyle = {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const modalBodyStyle = {
    padding: '2rem',
    overflowY: 'auto'
};

const sectionTitleStyle = {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'var(--primary)',
    marginBottom: '1rem',
    letterSpacing: '0.05em'
};
