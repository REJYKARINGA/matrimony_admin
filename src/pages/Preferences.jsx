import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function Preferences() {
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchPreferences(1);
    }, [search]);

    const fetchPreferences = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/preferences', {
                params: {
                    search,
                    page
                }
            });
            setPreferences(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch preferences', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchPreferences(page);
    };

    const formatArray = (array) => {
        if (!array || !Array.isArray(array) || array.length === 0) return '-';
        return array.join(', ');
    };

    const formatIncome = (income) => {
        if (income === null || income === undefined) return '-';
        return `₹${parseFloat(income).toLocaleString('en-IN')}`;
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>User Preferences</h2>
                <input
                    type="text"
                    placeholder="Search preferences..."
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
                                    <th>Min Age</th>
                                    <th>Max Age</th>
                                    <th>Min Height</th>
                                    <th>Max Height</th>
                                    <th>Marital Status</th>
                                    <th>Religion</th>
                                    <th>Caste</th>
                                    <th>Education</th>
                                    <th>Occupation</th>
                                    <th>Min Income</th>
                                    <th>Max Income</th>
                                    <th>Max Distance</th>
                                    <th>Preferred Locations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preferences.map((preference) => (
                                    <tr key={preference.id}>
                                        <td>
                                            {preference.user?.user_profile ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>
                                                        {preference.user.user_profile.first_name} {preference.user.user_profile.last_name}
                                                    </div>
                                                    <small style={{ color: 'var(--text-secondary)' }}>
                                                        {preference.user.matrimony_id}
                                                    </small>
                                                </div>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                        <td>{preference.min_age || '-'}</td>
                                        <td>{preference.max_age || '-'}</td>
                                        <td>{preference.min_height ? `${preference.min_height} cm` : '-'}</td>
                                        <td>{preference.max_height ? `${preference.max_height} cm` : '-'}</td>
                                        <td>
                                            {preference.marital_status ? (
                                                <span className="badge" style={{ textTransform: 'capitalize' }}>
                                                    {preference.marital_status.replace('_', ' ')}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {preference.religion ? (
                                                <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                                                    {preference.religion}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>{formatArray(preference.caste)}</td>
                                        <td>{formatArray(preference.education_names)}</td>
                                        <td>{formatArray(preference.occupation_names)}</td>
                                        <td>{formatIncome(preference.min_income)}</td>
                                        <td>{formatIncome(preference.max_income)}</td>
                                        <td>{preference.max_distance ? `${preference.max_distance} km` : '-'}</td>
                                        <td>{formatArray(preference.preferred_locations)}</td>
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