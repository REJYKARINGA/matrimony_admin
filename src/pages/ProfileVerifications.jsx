import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaUserCheck, FaSearch, FaTimes, FaEdit, FaInfoCircle, FaCheck, FaSave } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';

const SELECT_STYLE = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--primary)',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    outline: 'none'
};

const KERALA_DISTRICTS = [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

const ProfileVerifications = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('updated_at');
    const [sortDir, setSortDir] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [selectedProfileIds, setSelectedProfileIds] = useState([]);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        confirmText: 'Confirm',
        confirmButtonClass: 'btn-primary'
    });
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Dropdown options
    const [religions, setReligions] = useState([]);
    const [castes, setCastes] = useState([]);
    const [subCastes, setSubCastes] = useState([]);
    const [educations, setEducations] = useState([]);
    const [occupations, setOccupations] = useState([]);

    const extractArray = (d) => Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [relRes, casRes, subRes, eduRes, occRes] = await Promise.all([
                    api.get('/admin/religions'),
                    api.get('/admin/castes'),
                    api.get('/admin/sub-castes'),
                    api.get('/admin/education'),
                    api.get('/admin/occupations')
                ]);
                setReligions(extractArray(relRes.data));
                setCastes(extractArray(casRes.data));
                setSubCastes(extractArray(subRes.data));
                setEducations(extractArray(eduRes.data));
                setOccupations(extractArray(occRes.data));
            } catch (error) {
                console.error('Failed to fetch options:', error);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        fetchProfiles(currentPage);
    }, [currentPage, searchTerm, sortBy, sortDir]);

    const fetchProfiles = async (page) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/profile-verifications', {
                params: {
                    page,
                    search: searchTerm,
                    sort_by: sortBy,
                    sort_dir: sortDir
                }
            });
            setProfiles(response.data.data);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);

            if (selectedProfile) {
                const updated = response.data.data.find(p => p.id === selectedProfile.id);
                if (updated) setSelectedProfile(updated);
            }
        } catch (error) {
            console.error('Failed to fetch profile verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (profileId) => {
        try {
            setIsProcessing(true);
            await api.post(`/admin/profile-verifications/${profileId}/approve`);
            showToast('Profile approved successfully');
            setSelectedProfile(null);
            fetchProfiles(currentPage);
        } catch (error) {
            showToast('Failed to approve profile changes', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleProfileSelection = (e, profileId) => {
        e.stopPropagation();
        setSelectedProfileIds(prev => 
            prev.includes(profileId) 
                ? prev.filter(id => id !== profileId) 
                : [...prev, profileId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProfileIds.length === profiles.length && profiles.length > 0) {
            setSelectedProfileIds([]);
        } else {
            setSelectedProfileIds(profiles.map(p => p.id));
        }
    };

    const handleBulkApprove = async () => {
        setIsProcessing(true);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < selectedProfileIds.length; i++) {
            const profileId = selectedProfileIds[i];
            try {
                // Show progressive progress for bulk hits
                showToast(`Processing approval ${i + 1}/${selectedProfileIds.length}...`);
                await api.post(`/admin/profile-verifications/${profileId}/approve`);
                successCount++;
            } catch (error) {
                console.error(`Failed to approve profile ${profileId}:`, error);
                errorCount++;
            }
        }

        setIsProcessing(false);
        setSelectedProfileIds([]);
        fetchProfiles(currentPage);
        
        if (errorCount === 0) {
            showToast(`Successfully approved ${successCount} profiles`);
        } else {
            showToast(`Bulk approval finished. Success: ${successCount}, Failed: ${errorCount}`, 'error');
        }
    };

    const confirmBulkApprove = () => {
        if (selectedProfileIds.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: 'Bulk Profile Approval',
            message: `You are about to approve ${selectedProfileIds.length} profiles. This will verify all modified fields and activate these profiles. Do you want to continue?`,
            onConfirm: handleBulkApprove,
            confirmText: `Approve ${selectedProfileIds.length} Profiles`,
            confirmButtonClass: 'btn-success'
        });
    };

    const confirmSingleApprove = (profileId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Approve Profile',
            message: 'Are you sure you want to approve this profile? This will verify all changed fields.',
            onConfirm: () => {
                handleApprove(profileId);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            confirmText: 'Approve Now',
            confirmButtonClass: 'btn-success'
        });
    };

    const handleStartEdit = (field, value) => {
        setEditingField(field);
        setTempValue(value || '');
    };

    const handleSaveEdit = async () => {
        if (!selectedProfile || !editingField) return;

        try {
            setIsProcessing(true);
            const payload = {
                [editingField]: tempValue
            };
            
            await api.put(`/admin/user-profiles/${selectedProfile.id}`, payload);
            showToast(`${formatFieldName(editingField)} updated`);
            await fetchProfiles(currentPage);
            setEditingField(null);
        } catch (error) {
            console.error('Failed to update field:', error);
            showToast('Failed to update field. Please check validation rules.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatFieldName = (field) => {
        if (!field) return 'Unknown Field';
        return field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getFieldDisplayValue = (field, value) => {
        if (value === null || value === undefined || value === '') return 'Not set';
        
        if (field === 'religion_id') return religions.find(r => r.id == value)?.name || 'Unknown Religion';
        if (field === 'caste_id') return castes.find(c => c.id == value)?.name || 'Unknown Caste';
        if (field === 'sub_caste_id') return subCastes.find(s => s.id == value)?.name || 'Unknown Sub Caste';
        if (field === 'education_id') return educations.find(e => e.id == value)?.name || 'Unknown Education';
        if (field === 'occupation_id') return occupations.find(o => o.id == value)?.name || 'Unknown Occupation';
        
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (field === 'date_of_birth') return new Date(value).toLocaleDateString();
        return value.toString();
    };

    const renderEditInput = (field) => {
        if (field === 'religion_id') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select Religion</option>
                    {religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            );
        }
        if (field === 'caste_id') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select Caste</option>
                    {castes
                        .filter(c => !selectedProfile.religion_id || c.religion_id == selectedProfile.religion_id)
                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            );
        }
        if (field === 'sub_caste_id') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select Sub Caste</option>
                    {subCastes
                        .filter(sc => !selectedProfile.caste_id || sc.caste_id == selectedProfile.caste_id)
                        .map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
            );
        }
        if (field === 'education_id') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select Education</option>
                    {educations.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            );
        }
        if (field === 'occupation_id') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select Occupation</option>
                    {occupations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            );
        }
        if (field === 'district') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select District</option>
                    {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            );
        }
        if (field === 'gender') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            );
        }
        if (field === 'marital_status') {
            return (
                <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={SELECT_STYLE}>
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="never_married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                </select>
            );
        }
        if (field === 'date_of_birth') {
            return (
                <input 
                    type="date" 
                    value={tempValue ? tempValue.substring(0, 10) : ''} 
                    onChange={(e) => setTempValue(e.target.value)} 
                    style={{ ...SELECT_STYLE, colorScheme: 'dark' }} 
                />
            );
        }
        if (field === 'height' || field === 'weight' || field === 'annual_income') {
            return (
                <input 
                    type="number" 
                    value={tempValue} 
                    onChange={(e) => setTempValue(e.target.value)} 
                    style={SELECT_STYLE} 
                />
            );
        }
        if (field === 'bio') {
            return (
                <textarea 
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    style={{
                        ...SELECT_STYLE,
                        minHeight: '120px',
                    }}
                />
            );
        }
        
        return (
            <input 
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                style={SELECT_STYLE}
            />
        );
    };

    const userCardStyle = {
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.3s',
        cursor: 'pointer'
    };

    const badgeStyle = {
        padding: '0.25rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Profile Verifications</h2>
                    <div className="search-box" style={{ display: 'flex', gap: '0.75rem' }}>
                        <select
                            value={`${sortBy}-${sortDir}`}
                            onChange={(e) => {
                                const [by, dir] = e.target.value.split('-');
                                setSortBy(by);
                                setSortDir(dir);
                            }}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-color)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            <option value="updated_at-desc">Sort: New Requests</option>
                            <option value="name-asc">Sort: Name (A-Z)</option>
                            <option value="name-desc">Sort: Name (Z-A)</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search by name, email, matrimony ID..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-color)',
                                minWidth: '350px',
                                outline: 'none',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                </div>

                <div style={{ 
                    background: 'rgba(56, 189, 248, 0.1)', 
                    padding: '1rem', 
                    borderRadius: '0.75rem', 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                }}>
                    <FaInfoCircle />
                    <span style={{ fontSize: '0.9rem' }}>
                        Moderators can review and edit user-modified profile fields. District is limited to Kerala State.
                    </span>
                </div>

                {profiles.length > 0 && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border-color)',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedProfileIds.length === profiles.length && profiles.length > 0}
                                    onChange={handleSelectAll}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                />
                                Select All ({profiles.length})
                            </label>
                            {selectedProfileIds.length > 0 && (
                                <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>
                                    {selectedProfileIds.length} Selected
                                </span>
                            )}
                        </div>
                        
                        {selectedProfileIds.length > 0 && (
                            <button 
                                onClick={confirmBulkApprove}
                                disabled={isProcessing}
                                className="btn btn-success"
                                style={{ 
                                    padding: '0.6rem 1.5rem', 
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                                }}
                            >
                                <FaCheck /> {isProcessing ? 'Processing...' : 'Bulk Approve Selected'}
                            </button>
                        )}
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile changes...</div>
                ) : profiles.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <FaUserCheck size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No profiles pending verification found.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {profiles.map((profile) => (
                                <div 
                                    key={profile.id} 
                                    style={userCardStyle}
                                    onClick={() => setSelectedProfile(profile)}
                                    className="verification-card"
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedProfileIds.includes(profile.id)}
                                                onChange={(e) => toggleProfileSelection(e, profile.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ 
                                                    width: '20px', 
                                                    height: '20px', 
                                                    marginTop: '4px',
                                                    cursor: 'pointer', 
                                                    accentColor: 'var(--primary)',
                                                    flexShrink: 0
                                                }}
                                            />
                                            <div>
                                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                                                    {profile.first_name || 'Incomplete'} {profile.last_name || 'Profile'}
                                                </h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {profile.user?.matrimony_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            ...badgeStyle, 
                                            backgroundColor: profile.is_active_verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: profile.is_active_verified ? '#22c55e' : '#ef4444'
                                        }}>
                                            {profile.is_active_verified ? 'Verified' : 'Unverified'}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '60px', overflow: 'hidden' }}>
                                        {(profile.changed_fields || []).map(field => (
                                            <span key={field} style={{ 
                                                fontSize: '0.7rem', 
                                                background: 'rgba(255,255,255,0.05)', 
                                                padding: '0.2rem 0.5rem', 
                                                borderRadius: '4px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {formatFieldName(field)}
                                            </span>
                                        ))}
                                        {profile.changed_fields && profile.changed_fields.length > 3 && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>
                                                +{profile.changed_fields.length - 3} more
                                            </span>
                                        )}
                                        {!profile.changed_fields && !profile.is_active_verified && (
                                            <span style={{ fontSize: '0.75rem', color: '#eab308' }}>Initial Registration Pool</span>
                                        )}
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                            Review & Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                            totalItems={totalItems}
                            itemsPerPage={15}
                        />
                    </>
                )}
            </div>

            {/* Modal */}
            {selectedProfile && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                    onClick={() => !isProcessing && setSelectedProfile(null)}
                >
                    <div 
                        style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '850px', borderRadius: '1.5rem', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Review Profile Details</h3>
                            <button onClick={() => setSelectedProfile(null)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.25rem' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', flexShrink: 0 }}>
                                    <img 
                                        src={selectedProfile.profile_picture || 'https://via.placeholder.com/100'} 
                                        alt="Profile" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h2 style={{ margin: '0 0 0.25rem 0' }}>{selectedProfile.first_name} {selectedProfile.last_name}</h2>
                                    <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 'bold' }}>{selectedProfile.user?.matrimony_id}</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedProfile.user?.email}</p>
                                </div>
                            </div>

                            <h4 style={{ color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                                {selectedProfile.changed_fields ? 'Modified Fields for Review' : 'Full Profile Review'}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(selectedProfile.changed_fields || ['gender', 'date_of_birth', 'marital_status', 'religion_id', 'caste_id', 'city', 'district', 'state', 'bio']).map(field => (
                                    <div key={field} style={{ 
                                        background: 'rgba(255,255,255,0.02)', 
                                        padding: '1.25rem', 
                                        borderRadius: '1rem', 
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                                                {formatFieldName(field)}
                                            </span>
                                            {editingField !== field && (
                                                <button 
                                                    onClick={() => handleStartEdit(field, selectedProfile[field])}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                >
                                                    <FaEdit /> Edit Content
                                                </button>
                                            )}
                                        </div>

                                        {editingField === field ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {renderEditInput(field)}
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button 
                                                        onClick={handleSaveEdit}
                                                        disabled={isProcessing}
                                                        style={{ 
                                                            padding: '0.5rem 1rem', 
                                                            background: 'var(--primary)', 
                                                            color: 'white', 
                                                            border: 'none', 
                                                            borderRadius: '4px', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        <FaSave /> Save Changes
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingField(null)}
                                                        disabled={isProcessing}
                                                        style={{ 
                                                            padding: '0.5rem 1rem', 
                                                            background: 'none', 
                                                            color: 'var(--text-secondary)', 
                                                            border: '1px solid var(--border-color)', 
                                                            borderRadius: '4px', 
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ 
                                                fontWeight: '600', 
                                                color: (selectedProfile.changed_fields?.includes(field)) ? '#eab308' : 'var(--text)',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.5'
                                            }}>
                                                {getFieldDisplayValue(field, selectedProfile[field])}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                            <button 
                                className="btn btn-success" 
                                style={{ flex: 1, padding: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                onClick={() => confirmSingleApprove(selectedProfile.id)}
                                disabled={isProcessing || !!editingField}
                            >
                                <FaCheck />
                                {isProcessing ? 'Processing...' : 'Approve Profile'}
                            </button>
                            <button 
                                className="btn btn-outline" 
                                style={{ flex: 1, padding: '1rem', fontWeight: 'bold' }}
                                onClick={() => setSelectedProfile(null)}
                                disabled={isProcessing}
                            >
                                Finish Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                confirmButtonClass={confirmModal.confirmButtonClass}
            />

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000000,
                    padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: '600', fontSize: '0.9rem',
                    background: toast.type === 'error' ? '#EF4444' : '#10B981', color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'modalSlideUp 0.3s ease-out',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                    {toast.msg}
                </div>
            )}

            <style>{`
                .verification-card:hover {
                    border-color: var(--primary) !important;
                    background: rgba(255,255,255,0.04) !important;
                    transform: translateY(-4px);
                }
                select option {
                    background: #111;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default ProfileVerifications;
