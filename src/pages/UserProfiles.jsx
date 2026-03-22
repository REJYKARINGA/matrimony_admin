import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function UserProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchProfiles(1);
    }, [search]);

    const fetchProfiles = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/user-profiles', {
                params: {
                    search,
                    page
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

    const handlePageChange = (page) => {
        fetchProfiles(page);
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>User Profiles</h2>
                <input
                    type="text"
                    placeholder="Search profiles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '300px', marginBottom: 0 }}
                />
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Profile Picture</th>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Gender</th>
                                    <th>Religion</th>
                                    <th>Location</th>
                                    <th>Education</th>
                                    <th>Occupation</th>
                                    <th>Status</th>
                                    <th>Verification Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map((profile) => (
                                    <tr key={profile.id}>
                                        <td>
                                            {profile.profile_picture ? (
                                                <img
                                                    className="profile-img-zoom"
                                                    src={profile.profile_picture.startsWith('http') 
                                                        ? profile.profile_picture 
                                                        : `${import.meta.env.VITE_API_BASE_URL}/storage/${profile.profile_picture}`}
                                                    alt="Profile"
                                                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        const isMale = ['male', 'm', 'groom'].includes(String(profile.gender).toLowerCase());
                                                        const color1 = isMale ? '%2360a5fa' : '%23f472b6';
                                                        const color2 = isMale ? '%232563eb' : '%23db2777';
                                                        e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${color1}'/%3E%3Cstop offset='100%25' stop-color='${color2}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23bg)'/%3E%3Ccircle cx='50' cy='36' r='18' fill='white'/%3E%3Cpath d='M15,100 Q15,65 50,65 Q85,65 85,100 Z' fill='white'/%3E%3C/svg%3E`;
                                                    }}
                                                />
                                            ) : (
                                                <img 
                                                    src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${['male', 'm', 'groom'].includes(String(profile.gender).toLowerCase()) ? '%2360a5fa' : '%23f472b6'}'/%3E%3Cstop offset='100%25' stop-color='${['male', 'm', 'groom'].includes(String(profile.gender).toLowerCase()) ? '%232563eb' : '%23db2777'}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23bg)'/%3E%3Ccircle cx='50' cy='36' r='18' fill='white'/%3E%3Cpath d='M15,100 Q15,65 50,65 Q85,65 85,100 Z' fill='white'/%3E%3C/svg%3E`}
                                                    alt="Fallback Avatar"
                                                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {profile.first_name} {profile.last_name}
                                            </div>
                                        </td>
                                        <td>
                                            {profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : '-'}
                                        </td>
                                        <td>
                                            <span className="badge" style={{ textTransform: 'capitalize' }}>
                                                {profile.gender}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                                                {profile.religion_model?.name || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            {profile.city}, {profile.state}
                                        </td>
                                        <td>
                                            {profile.education_model?.name || '-'}
                                        </td>
                                        <td>
                                            {profile.occupation_model?.name || '-'}
                                        </td>

                                        <td>
                                            <span className={`badge ${profile.is_active_verified ? 'badge-verified' : 'badge-rejected'}`}>
                                                {profile.is_active_verified ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td>
                                            {(() => {
                                                const status = profile.user?.verification?.status;
                                                let badgeClass = 'badge-secondary';
                                                let statusText = 'Not Submitted';

                                                if (status === 'verified') {
                                                    badgeClass = 'badge-success';
                                                    statusText = 'Verified';
                                                } else if (status === 'pending') {
                                                    badgeClass = 'badge-warning';
                                                    statusText = 'Pending';
                                                } else if (status === 'rejected') {
                                                    badgeClass = 'badge-danger';
                                                    statusText = 'Rejected';
                                                }

                                                return (
                                                    <span className={`badge ${badgeClass}`} style={{ textTransform: 'capitalize' }}>
                                                        {statusText}
                                                    </span>
                                                );
                                            })()}
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
    );
}