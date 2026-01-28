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
                                    <th>Verified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map((profile) => (
                                    <tr key={profile.id}>
                                        <td>
                                            {profile.profile_picture ? (
                                                <img 
                                                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/${profile.profile_picture}`} 
                                                    alt="Profile" 
                                                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '12px' }}>No Photo</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {profile.first_name} {profile.last_name}
                                            </div>
                                        </td>
                                        <td>
                                            {profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 'N/A'}
                                        </td>
                                        <td>
                                            <span className="badge" style={{ textTransform: 'capitalize' }}>
                                                {profile.gender}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                                                {profile.religion}
                                            </span>
                                        </td>
                                        <td>
                                            {profile.city}, {profile.state}
                                        </td>
                                        <td>
                                            {profile.education || 'N/A'}
                                        </td>
                                        <td>
                                            {profile.occupation || 'N/A'}
                                        </td>
                                        <td>
                                            <span className={`badge ${profile.is_active_verified ? 'badge-verified' : 'badge-rejected'}`}>
                                                {profile.is_active_verified ? 'Yes' : 'No'}
                                            </span>
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