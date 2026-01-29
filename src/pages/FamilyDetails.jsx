import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function FamilyDetails() {
    const [familyDetails, setFamilyDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchFamilyDetails(1);
    }, [search]);

    const fetchFamilyDetails = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/family-details', {
                params: {
                    search,
                    page
                }
            });
            setFamilyDetails(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch family details', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchFamilyDetails(page);
    };

    const formatBoolean = (value) => {
        if (value === null || value === undefined) return '-';
        return value ? 'Yes' : 'No';
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Family Details</h2>
                <input
                    type="text"
                    placeholder="Search family details..."
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
                                    <th>User</th>
                                    <th>Father Name</th>
                                    <th>Father Occupation</th>
                                    <th>Mother Name</th>
                                    <th>Mother Occupation</th>
                                    <th>Siblings</th>
                                    <th>Elder Sister</th>
                                    <th>Elder Brother</th>
                                    <th>Younger Sister</th>
                                    <th>Younger Brother</th>
                                    <th>Family Type</th>
                                    <th>Family Status</th>
                                    <th>Family Location</th>
                                    <th>Father Alive</th>
                                    <th>Mother Alive</th>
                                    <th>Is Disabled</th>
                                    <th>Twin Type</th>
                                    <th>Guardian</th>
                                    <th>Show</th>
                                </tr>
                            </thead>
                            <tbody>
                                {familyDetails.map((detail) => (
                                    <tr key={detail.id}>
                                        <td>
                                            {detail.user?.user_profile ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>
                                                        {detail.user.user_profile.first_name} {detail.user.user_profile.last_name}
                                                    </div>
                                                    <small style={{ color: 'var(--text-secondary)' }}>
                                                        {detail.user.matrimony_id}
                                                    </small>
                                                </div>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                        <td>{detail.father_name || '-'}</td>
                                        <td>{detail.father_occupation || '-'}</td>
                                        <td>{detail.mother_name || '-'}</td>
                                        <td>{detail.mother_occupation || '-'}</td>
                                        <td>{detail.siblings || 0}</td>
                                        <td>{detail.elder_sister || 0}</td>
                                        <td>{detail.elder_brother || 0}</td>
                                        <td>{detail.younger_sister || 0}</td>
                                        <td>{detail.younger_brother || 0}</td>
                                        <td>
                                            {detail.family_type ? (
                                                <span className="badge" style={{ textTransform: 'capitalize' }}>
                                                    {detail.family_type}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {detail.family_status ? (
                                                <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                                                    {detail.family_status.replace('_', ' ')}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>{detail.family_location || '-'}</td>
                                        <td>
                                            <span className={`badge ${detail.father_alive ? 'badge-verified' : 'badge-rejected'}`}>
                                                {formatBoolean(detail.father_alive)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${detail.mother_alive ? 'badge-verified' : 'badge-rejected'}`}>
                                                {formatBoolean(detail.mother_alive)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${detail.is_disabled ? 'badge-rejected' : 'badge-verified'}`}>
                                                {formatBoolean(detail.is_disabled)}
                                            </span>
                                        </td>
                                        <td>{detail.twin_type || '-'}</td>
                                        <td>{detail.guardian || '-'}</td>
                                        <td>
                                            <span className={`badge ${detail.show ? 'badge-verified' : 'badge-rejected'}`}>
                                                {formatBoolean(detail.show)}
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