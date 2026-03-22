import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import { FaPlus, FaEdit, FaTrash, FaTrashRestore, FaExclamationTriangle } from 'react-icons/fa';

const SELECT_STYLE = {
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.85rem'
};

// Reusable toggle switch
const Toggle = ({ name, checked, onChange, label }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
        <div
            onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
            style={{
                width: '42px', height: '24px', borderRadius: '999px', flexShrink: 0,
                background: checked ? 'var(--primary)' : 'var(--border-color)',
                position: 'relative', transition: 'background 0.25s',
                cursor: 'pointer'
            }}
        >
            <div style={{
                position: 'absolute', top: '3px',
                left: checked ? '21px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'white',
                transition: 'left 0.25s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
            }} />
        </div>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</span>
    </label>
);

// Custom User Select for independent coloring
const CustomUserSelect = ({ users, value, onChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    useEffect(() => {
        const handleClickOutside = () => setIsOpen(false);
        if (isOpen) window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    const selectedUser = users.find(u => u.id == value);
    const filteredUsers = users.filter(u => 
        u.matrimony_id.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search))
    );

    return (
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    ...SELECT_STYLE, 
                    padding: '0.65rem 0.85rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    minHeight: '40px',
                    borderColor: error ? '#EF4444' : 'var(--border-color)'
                }}
            >
                {selectedUser ? (
                    <span style={{ color: (selectedUser.email_verified && selectedUser.phone_verified) ? '#10B981' : 'inherit' }}>
                        {selectedUser.matrimony_id} | {selectedUser.email}
                    </span>
                ) : (
                    <span style={{ color: '#6B7280' }}>Select a user</span>
                )}
                <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
            </div>

            {isOpen && (
                <div style={{ 
                    position: 'absolute', top: '105%', left: 0, right: 0, 
                    zIndex: 1000, background: 'var(--card-bg)', 
                    border: '1px solid var(--border-color)', borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    overflow: 'hidden', maxHeight: '300px', display: 'flex', flexDirection: 'column'
                }}>
                    <input 
                        placeholder="Search..." 
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0, padding: '0.8rem', background: 'transparent' }} 
                    />
                    <div style={{ overflowY: 'auto' }}>
                        {filteredUsers.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', opacity: 0.7 }}>No users found</div>
                        ) : (
                            filteredUsers.map(u => {
                                const isV = u.email_verified && u.phone_verified;
                                return (
                                    <div 
                                        key={u.id}
                                        onClick={() => { onChange({ target: { name: 'user_id', value: u.id } }); setIsOpen(false); }}
                                        style={{ 
                                            padding: '0.75rem 1rem', 
                                            cursor: 'pointer', 
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            background: value == u.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                            fontSize: '0.85rem',
                                            transition: 'background 0.2s'
                                        }}
                                        className="user-select-item"
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = value == u.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'}
                                    >
                                        {isV ? (
                                            <span style={{ color: '#10B981', fontWeight: 'bold' }}>{u.matrimony_id} | {u.email}</span>
                                        ) : (
                                            <>
                                                <span style={{ opacity: 0.7 }}>{u.matrimony_id} | </span>
                                                <span style={{ color: u.email_verified ? '#10B981' : '#EF4444' }}>{u.email}</span>
                                                <span style={{ opacity: 0.7 }}> | </span>
                                                <span style={{ color: u.phone_verified ? '#10B981' : '#EF4444' }}>{u.phone}</span>
                                            </>
                                        )}
                                        <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '2px' }}>
                                            Role: {u.role} - Status: {u.status}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
            {error && <span style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>{error[0]}</span>}
        </div>
    );
};

const EMPTY_FORM = {
    user_id: '',
    first_name: '', last_name: '',
    date_of_birth: '', gender: '',
    height: '', weight: '',
    marital_status: '', mother_tongue: 'Malayalam',
    drug_addiction: false, smoke: false, alcohol: false,
    religion_id: '', caste_id: '', sub_caste_id: '',
    education_id: '', occupation_id: '',
    annual_income: '',
    city: '', district: '', county: '', state: 'Kerala', country: 'India',
    present_city: '', present_country: '', postal_code: '',
    bio: '',
    hide_photos: false,
    is_active_verified: false,
    profile_picture: null,
};

export default function UserProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'trashed'

    // Filters
    const [genderFilter, setGenderFilter] = useState('all');
    const [religionFilter, setReligionFilter] = useState('all');
    const [educationFilter, setEducationFilter] = useState('all');
    const [occupationFilter, setOccupationFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');

    // Dropdown option lists
    const [religions, setReligions] = useState([]);
    const [castes, setCastes] = useState([]);
    const [educations, setEducations] = useState([]);
    const [occupations, setOccupations] = useState([]);
    const [subCastes, setSubCastes] = useState([]);
    const [usersWithoutProfile, setUsersWithoutProfile] = useState([]);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);

    // Confirm modal
    const [confirm, setConfirm] = useState({ open: false, id: null, action: '', message: '' });
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const extractArray = (d) => Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

    useEffect(() => {
        api.get('/admin/religions').then(r => setReligions(extractArray(r.data))).catch(() => {});
        api.get('/admin/castes').then(r => setCastes(extractArray(r.data))).catch(() => {});
        api.get('/admin/sub-castes').then(r => setSubCastes(extractArray(r.data))).catch(() => {});
        api.get('/admin/education').then(r => setEducations(extractArray(r.data))).catch(() => {});
        api.get('/admin/occupations').then(r => setOccupations(extractArray(r.data))).catch(() => {});
    }, []);

    useEffect(() => {
        fetchProfiles(1);
    }, [search, activeTab, genderFilter, religionFilter, educationFilter, occupationFilter, statusFilter, verificationFilter, ageMin, ageMax]);

    const fetchProfiles = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/user-profiles', {
                params: {
                    search: search || undefined,
                    page,
                    trashed: activeTab === 'trashed' ? 1 : 0,
                    ...(genderFilter !== 'all' && { gender: genderFilter }),
                    ...(religionFilter !== 'all' && { religion_id: religionFilter }),
                    ...(educationFilter !== 'all' && { education_id: educationFilter }),
                    ...(occupationFilter !== 'all' && { occupation_id: occupationFilter }),
                    ...(statusFilter !== 'all' && { is_active_verified: statusFilter }),
                    ...(verificationFilter !== 'all' && { verification_status: verificationFilter }),
                    ...(ageMin && { age_min: ageMin }),
                    ...(ageMax && { age_max: ageMax }),
                }
            });
            setProfiles(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch user profiles', error);
        } finally {
            setLoading(false);
        }
    };

    const getAge = (dob) => {
        if (!dob) return '-';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const getAvatarSrc = (gender) => {
        const isMale = ['male', 'm', 'groom'].includes(String(gender).toLowerCase());
        const c1 = isMale ? '%2360a5fa' : '%23f472b6';
        const c2 = isMale ? '%232563eb' : '%23db2777';
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${c1}'/%3E%3Cstop offset='100%25' stop-color='${c2}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23bg)'/%3E%3Ccircle cx='50' cy='36' r='18' fill='white'/%3E%3Cpath d='M15,100 Q15,65 50,65 Q85,65 85,100 Z' fill='white'/%3E%3C/svg%3E`;
    };

    // --- Form ---
    const handleAdd = async () => {
        setFormMode('add');
        setFormData(EMPTY_FORM);
        setFormErrors({});
        setSelectedProfile(null);
        setIsFormOpen(true);
        try {
            const res = await api.get('/admin/users-without-profile');
            setUsersWithoutProfile(extractArray(res.data));
        } catch (err) {
            console.error('Failed to fetch users without profile:', err);
        }
    };

    const handleEdit = (profile) => {
        setFormMode('edit');
        setSelectedProfile(profile);
        setFormData({
            user_id: profile.user_id || '',
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            date_of_birth: profile.date_of_birth ? profile.date_of_birth.substring(0, 10) : '',
            gender: profile.gender || '',
            height: profile.height || '',
            weight: profile.weight || '',
            marital_status: profile.marital_status || '',
            mother_tongue: profile.mother_tongue || 'Malayalam',
            drug_addiction: !!profile.drug_addiction,
            smoke: !!profile.smoke,
            alcohol: !!profile.alcohol,
            religion_id: profile.religion_id || '',
            caste_id: profile.caste_id || '',
            sub_caste_id: profile.sub_caste_id || '',
            education_id: profile.education_id || '',
            occupation_id: profile.occupation_id || '',
            annual_income: profile.annual_income || '',
            city: profile.city || '',
            district: profile.district || '',
            county: profile.county || '',
            state: profile.state || 'Kerala',
            country: profile.country || 'India',
            present_city: profile.present_city || '',
            present_country: profile.present_country || '',
            postal_code: profile.postal_code || '',
            bio: profile.bio || '',
            hide_photos: !!profile.hide_photos,
            is_active_verified: !!profile.is_active_verified,
            profile_picture: null,
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormErrors({});
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    if (typeof formData[key] === 'boolean') {
                        submitData.append(key, formData[key] ? '1' : '0');
                    } else {
                        submitData.append(key, formData[key]);
                    }
                }
            });

            if (formMode === 'add') {
                await api.post('/admin/user-profiles', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
                showToast('Profile created successfully');
            } else {
                submitData.append('_method', 'PUT'); // Fake PUT for Laravel file uploads
                await api.post(`/admin/user-profiles/${selectedProfile.id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
                showToast('Profile updated successfully');
            }
            setIsFormOpen(false);
            fetchProfiles(currentPage);
        } catch (err) {
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                showToast(err.response?.data?.message || 'Something went wrong', 'error');
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] || null }));
        } else {
            setFormData(prev => {
                const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
                
                // Intelligently auto-fill or reset hierarchal relationships
                if (name === 'religion_id') {
                    if (!value) {
                        newData.caste_id = '';
                        newData.sub_caste_id = '';
                    } else if (newData.caste_id) {
                        const caste = castes.find(c => c.id == newData.caste_id);
                        if (caste && caste.religion_id != value) {
                            newData.caste_id = '';
                            newData.sub_caste_id = '';
                        }
                    }
                }
                
                if (name === 'caste_id') {
                    if (!value) {
                        newData.sub_caste_id = '';
                    } else {
                        // Auto-fill religion upward
                        const caste = castes.find(c => c.id == value);
                        if (caste) newData.religion_id = caste.religion_id;
                        
                        // Reset subcaste downward if mismatched
                        if (newData.sub_caste_id) {
                            const sc = subCastes.find(s => s.id == newData.sub_caste_id);
                            if (sc && sc.caste_id != value) newData.sub_caste_id = '';
                        }
                    }
                }
                
                if (name === 'sub_caste_id' && value) {
                    // Auto-fill caste and religion upward
                    const sc = subCastes.find(s => s.id == value);
                    if (sc) {
                        newData.caste_id = sc.caste_id;
                        const caste = castes.find(c => c.id == sc.caste_id);
                        if (caste) newData.religion_id = caste.religion_id;
                    }
                }
                
                return newData;
            });
        }
    };

    // --- Delete / Restore ---
    const handleDelete = (profile) => {
        const isTrashed = activeTab === 'trashed';
        setConfirm({
            open: true,
            id: profile.id,
            action: isTrashed ? 'force_delete' : 'delete',
            message: isTrashed
                ? `Permanently delete profile of "${profile.first_name} ${profile.last_name}"? This cannot be undone.`
                : `Trash the profile of "${profile.first_name} ${profile.last_name}"?`
        });
    };

    const handleRestore = (profile) => {
        setConfirm({
            open: true,
            id: profile.id,
            action: 'restore',
            message: `Restore the profile of "${profile.first_name} ${profile.last_name}"?`
        });
    };

    const handleConfirm = async () => {
        setConfirmLoading(true);
        try {
            if (confirm.action === 'restore') {
                await api.post(`/admin/user-profiles/${confirm.id}/restore`);
                showToast('Profile restored successfully');
            } else {
                await api.delete(`/admin/user-profiles/${confirm.id}`);
                showToast(confirm.action === 'force_delete' ? 'Profile permanently deleted' : 'Profile trashed');
            }
            setConfirm({ open: false, id: null, action: '', message: '' });
            fetchProfiles(currentPage);
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    const clearFilters = () => {
        setGenderFilter('all'); setReligionFilter('all');
        setEducationFilter('all'); setOccupationFilter('all');
        setStatusFilter('all'); setVerificationFilter('all');
        setAgeMin(''); setAgeMax(''); setSearch('');
    };

    const hasFilters = genderFilter !== 'all' || religionFilter !== 'all' || educationFilter !== 'all'
        || occupationFilter !== 'all' || statusFilter !== 'all' || verificationFilter !== 'all'
        || ageMin || ageMax || search;

    return (
        <div className="card" style={{ position: 'relative' }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100000,
                    padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
                    background: toast.type === 'error' ? '#EF4444' : '#10B981', color: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>User Profiles</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '240px', marginBottom: 0 }}
                    />
                    <button onClick={handleAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FaPlus /> Add Profile
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                {[['active', 'Active Profiles'], ['trashed', 'Trashed']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '0.6rem 1rem', fontWeight: '600', fontSize: '0.95rem',
                        borderBottom: activeTab === key
                            ? `3px solid ${key === 'trashed' ? '#EF4444' : 'var(--primary)'}`
                            : '3px solid transparent',
                        color: activeTab === key
                            ? (key === 'trashed' ? '#EF4444' : 'var(--primary)')
                            : 'var(--text-secondary)',
                        transition: 'all 0.2s'
                    }}>{label}</button>
                ))}
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} style={SELECT_STYLE}>
                    <option value="all">Gender: All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <select value={religionFilter} onChange={(e) => setReligionFilter(e.target.value)} style={SELECT_STYLE}>
                    <option value="all">Religion: All</option>
                    {religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select value={educationFilter} onChange={(e) => setEducationFilter(e.target.value)} style={SELECT_STYLE}>
                    <option value="all">Education: All</option>
                    {educations.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <select value={occupationFilter} onChange={(e) => setOccupationFilter(e.target.value)} style={SELECT_STYLE}>
                    <option value="all">Occupation: All</option>
                    {occupations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={SELECT_STYLE}>
                    <option value="all">Status: All</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>
                <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} style={SELECT_STYLE}>
                    <option value="all">Verification: All</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="not_submitted">Not Submitted</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input type="number" placeholder="Age min" value={ageMin} onChange={(e) => setAgeMin(e.target.value)}
                        style={{ width: '75px', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>–</span>
                    <input type="number" placeholder="Age max" value={ageMax} onChange={(e) => setAgeMax(e.target.value)}
                        style={{ width: '75px', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 0 }} />
                </div>
                {hasFilters && (
                    <button onClick={clearFilters} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #EF4444', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}>
                        Clear
                    </button>
                )}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Profile</th>
                                    <th>Name</th>
                                    <th>Age / Gender</th>
                                    <th>Religion</th>
                                    <th>Location</th>
                                    <th>Education</th>
                                    <th>Occupation</th>
                                    <th>Status</th>
                                    <th>Verification</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.length === 0 ? (
                                    <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No profiles found</td></tr>
                                ) : profiles.map((profile) => (
                                    <tr key={profile.id}>
                                        <td>
                                            {profile.profile_picture ? (
                                                <img className="profile-img-zoom"
                                                    src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `${import.meta.env.VITE_API_BASE_URL}/storage/${profile.profile_picture}`}
                                                    alt="Profile"
                                                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = getAvatarSrc(profile.gender); }}
                                                />
                                            ) : (
                                                <img src={getAvatarSrc(profile.gender)} alt="Avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{profile.first_name} {profile.last_name}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{getAge(profile.date_of_birth)} yrs</div>
                                            <div style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: profile.gender === 'male' ? '#60a5fa' : '#f472b6', marginTop: '2px' }}>
                                                {profile.gender || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)', display: 'block', width: 'fit-content' }}>
                                                {profile.religion_model?.name || '-'}
                                            </span>
                                            {profile.caste_model?.name && (
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{profile.caste_model.name}</div>
                                            )}
                                            {profile.sub_caste_model?.name && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.75, marginTop: '1px' }}>{profile.sub_caste_model.name}</div>
                                            )}
                                        </td>
                                        <td>{[profile.city, profile.state].filter(Boolean).join(', ') || '-'}</td>
                                        <td>{profile.education_model?.name || '-'}</td>
                                        <td>{profile.occupation_model?.name || '-'}</td>
                                        <td>
                                            <span className={`badge ${profile.is_active_verified ? 'badge-verified' : 'badge-rejected'}`}>
                                                {profile.is_active_verified ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td>
                                            {(() => {
                                                const status = profile.user?.verification?.status;
                                                const map = { verified: { cls: 'badge-verified', label: 'Verified' }, pending: { cls: 'badge-warning', label: 'Pending' }, rejected: { cls: 'badge-rejected', label: 'Rejected' } };
                                                const { cls, label } = map[status] || { cls: 'badge-secondary', label: 'Not Submitted' };
                                                return <span className={`badge ${cls}`}>{label}</span>;
                                            })()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                {activeTab === 'trashed' ? (
                                                    <>
                                                        <button onClick={() => handleRestore(profile)} title="Restore"
                                                            style={{ background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <FaTrashRestore />
                                                        </button>
                                                        <button onClick={() => handleDelete(profile)} title="Permanently Delete"
                                                            style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEdit(profile)} title="Edit"
                                                            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <FaEdit />
                                                        </button>
                                                        <button onClick={() => handleDelete(profile)} title="Trash"
                                                            style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={fetchProfiles}
                        totalItems={totalItems}
                        itemsPerPage={15}
                    />
                </>
            )}

            {/* Add / Edit Modal */}
            <FormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={formMode === 'add' ? 'Add User Profile' : 'Edit User Profile'}
                onSubmit={handleFormSubmit}
                submitText={formMode === 'add' ? 'Create Profile' : 'Save Changes'}
                maxWidth="900px"
                isLoading={formLoading}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Personal Info */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Personal Info</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                            {formMode === 'add' && (
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">User *</label>
                                    <CustomUserSelect 
                                        users={usersWithoutProfile} 
                                        value={formData.user_id} 
                                        onChange={handleFormChange}
                                        error={formErrors.user_id}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="form-label">First Name *</label>
                                <input name="first_name" value={formData.first_name} onChange={handleFormChange} placeholder="First name" style={{ width: '100%', marginBottom: 0 }} />
                                {formErrors.first_name && <span style={{ color: '#EF4444', fontSize: '0.78rem' }}>{formErrors.first_name[0]}</span>}
                            </div>
                            <div>
                                <label className="form-label">Last Name *</label>
                                <input name="last_name" value={formData.last_name} onChange={handleFormChange} placeholder="Last name" style={{ width: '100%', marginBottom: 0 }} />
                                {formErrors.last_name && <span style={{ color: '#EF4444', fontSize: '0.78rem' }}>{formErrors.last_name[0]}</span>}
                            </div>
                            <div>
                                <label className="form-label">Date of Birth</label>
                                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleFormChange} style={{ width: '100%', marginBottom: 0 }} />
                            </div>
                            <div>
                                <label className="form-label">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleFormChange} style={{ width: '100%', ...SELECT_STYLE, padding: '0.5rem 0.75rem' }}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Marital Status</label>
                                <select name="marital_status" value={formData.marital_status} onChange={handleFormChange} style={{ width: '100%', ...SELECT_STYLE, padding: '0.5rem 0.75rem' }}>
                                    <option value="">Select</option>
                                    <option value="single">Single</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                    <option value="separated">Separated</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Mother Tongue</label>
                                <input name="mother_tongue" value={formData.mother_tongue} onChange={handleFormChange} placeholder="e.g. Malayalam" style={{ width: '100%', marginBottom: 0 }} />
                            </div>
                        </div>
                    </div>

                    {/* Physical */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Physical Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                            <div>
                                <label className="form-label">Height (cm)</label>
                                <input type="number" name="height" value={formData.height} onChange={handleFormChange} placeholder="e.g. 170" style={{ width: '100%', marginBottom: 0 }} />
                            </div>
                            <div>
                                <label className="form-label">Weight (kg)</label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleFormChange} placeholder="e.g. 65" style={{ width: '100%', marginBottom: 0 }} />
                            </div>
                        </div>
                    </div>

                    {/* Lifestyle */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Lifestyle</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                            {[['drug_addiction', 'Drug Addiction'], ['smoke', 'Smoke'], ['alcohol', 'Alcohol']].map(([field, label]) => (
                                <Toggle key={field} name={field} checked={formData[field]} onChange={handleFormChange} label={label} />
                            ))}
                        </div>
                    </div>

                    {/* Religion */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Religion & Community</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                            <div>
                                <label className="form-label">Religion</label>
                                <select name="religion_id" value={formData.religion_id} onChange={handleFormChange} style={{ width: '100%', ...SELECT_STYLE, padding: '0.5rem 0.75rem' }}>
                                    <option value="">Select</option>
                                    {religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Caste</label>
                                <select name="caste_id" value={formData.caste_id} onChange={handleFormChange} style={{ width: '100%', ...SELECT_STYLE, padding: '0.5rem 0.75rem' }}>
                                    <option value="">Select</option>
                                    {castes
                                        .filter(c => !formData.religion_id || c.religion_id == formData.religion_id)
                                        .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Sub Caste</label>
                                <select name="sub_caste_id" value={formData.sub_caste_id} onChange={handleFormChange} style={{ width: '100%', ...SELECT_STYLE, padding: '0.5rem 0.75rem' }}>
                                    <option value="">Select</option>
                                    {subCastes
                                        .filter(sc => {
                                            if (formData.caste_id) return sc.caste_id == formData.caste_id;
                                            if (formData.religion_id) {
                                                const parentCaste = castes.find(c => c.id == sc.caste_id);
                                                return parentCaste && parentCaste.religion_id == formData.religion_id;
                                            }
                                            return true;
                                        })
                                        .map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)
                                    }
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Professional */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Professional</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                            <div>
                                <label className="form-label">Education</label>
                                <select name="education_id" value={formData.education_id} onChange={handleFormChange} style={{ width: '100%', ...SELECT_STYLE, padding: '0.5rem 0.75rem' }}>
                                    <option value="">Select</option>
                                    {educations.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Occupation</label>
                                <select name="occupation_id" value={formData.occupation_id} onChange={handleFormChange} style={{ width: '100%', ...SELECT_STYLE, padding: '0.5rem 0.75rem' }}>
                                    <option value="">Select</option>
                                    {occupations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Annual Income</label>
                                <input type="number" name="annual_income" value={formData.annual_income} onChange={handleFormChange} placeholder="Annual income" style={{ width: '100%', marginBottom: 0 }} />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Location</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                            {[['city','City'],['district','District'],['county','County'],['state','State'],['country','Country'],['present_city','Present City'],['present_country','Present Country'],['postal_code','Postal Code']].map(([field, label]) => {
                                const isReadOnly = field === 'state' || field === 'country';
                                return (
                                <div key={field}>
                                    <label className="form-label">{label}</label>
                                    <input 
                                        name={field} 
                                        value={formData[field]} 
                                        onChange={handleFormChange} 
                                        placeholder={label} 
                                        readOnly={isReadOnly}
                                        style={{ 
                                            width: '100%', 
                                            marginBottom: 0,
                                            ...(isReadOnly ? { background: 'var(--hover-bg)', cursor: 'not-allowed', color: 'var(--text-secondary)' } : {})
                                        }} 
                                    />
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Bio & Settings */}
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Bio & Settings</div>
                        <textarea name="bio" value={formData.bio} onChange={handleFormChange} rows={3} placeholder="Short bio..." style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-primary)', padding: '0.5rem 0.75rem', resize: 'vertical', marginBottom: '1rem' }} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', alignItems: 'center' }}>
                            <div>
                                <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Profile Picture</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--hover-bg)', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                                        {formData.profile_picture ? (
                                            <img
                                                src={formData.profile_picture instanceof File ? URL.createObjectURL(formData.profile_picture) : (formData.profile_picture.startsWith('http') ? formData.profile_picture : `${import.meta.env.VITE_API_BASE_URL}/storage/${formData.profile_picture}`)}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = getAvatarSrc(formData.gender); }}
                                            />
                                        ) : selectedProfile?.profile_picture ? (
                                            <img
                                                src={selectedProfile.profile_picture.startsWith('http') ? selectedProfile.profile_picture : `${import.meta.env.VITE_API_BASE_URL}/storage/${selectedProfile.profile_picture}`}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = getAvatarSrc(formData.gender); }}
                                            />
                                        ) : (
                                            <img src={getAvatarSrc(formData.gender)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', ...(!formData.profile_picture && !selectedProfile?.profile_picture ? { border: '1px dashed #8B5CF6' } : { border: '1px solid transparent' }) }}>
                                            {formData.profile_picture ? 'Change Image' : 'Upload Image'}
                                            <input type="file" name="profile_picture" onChange={handleFormChange} accept="image/*" style={{ display: 'none' }} />
                                        </label>
                                        {formErrors.profile_picture && <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.2rem' }}>{formErrors.profile_picture[0]}</div>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.4rem' }}>
                                <Toggle name="is_active_verified" checked={formData.is_active_verified} onChange={handleFormChange} label="Profile Active" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.4rem' }}>
                                <Toggle name="hide_photos" checked={formData.hide_photos} onChange={handleFormChange} label="Hide Photos" />
                            </div>
                        </div>
                    </div>

                </div>
            </FormModal>

            {/* Confirm Modal */}
            {confirm.open && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <FaExclamationTriangle style={{ color: '#F59E0B', fontSize: '1.5rem' }} />
                            <h3 style={{ margin: 0 }}>Confirm Action</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{confirm.message}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirm({ open: false })} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleConfirm} disabled={confirmLoading}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: confirm.action === 'restore' ? '#10B981' : '#EF4444', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                                {confirmLoading ? 'Processing...' : confirm.action === 'restore' ? 'Restore' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}