import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function Preferences() {
    const [preferences, setPreferences] = useState([]);
    const [stats, setStats] = useState(null);
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
            setStats(response.data.stats);
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

    const formatStatus = (status) => {
        if (!status) return '-';
        const cleaned = status.toLowerCase().replace(/_/g, ' ');
        return ['never married', 'never_married', 'single'].includes(cleaned) ? 'Single' : status.replace(/_/g, ' ');
    };

    const formatIncome = (income) => {
        if (income === null || income === undefined || isNaN(income)) return '-';
        return `₹${parseFloat(income).toLocaleString('en-IN')}`;
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Global Insights & Preferences</h2>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aggregate data analysis across {totalItems} user profiles</p>
                </div>
                <input
                    type="text"
                    placeholder="Search profiles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '300px', marginBottom: 0 }}
                />
            </div>

            {stats && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '1.25rem', 
                    marginBottom: '2.5rem' 
                }}>
                    <div className="card" style={{ padding: '1.25rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status Pref. (Rank 1 & 2)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            1. {formatStatus(stats.status?.[0])}
                        </div>
                        {stats.status?.[1] && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'capitalize' }}>
                                2. {formatStatus(stats.status[1])}
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: '1.25rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Community (Rank 1 & 2)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            1. {stats.religion?.[0] || 'Any'}
                            {stats.caste?.[0] && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}> - {stats.caste[0]}</span>}
                        </div>
                        {stats.religion?.[1] && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                2. {stats.religion[1]}
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: '1.25rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Age & Height (Avg)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                           Age: {stats.avg_age?.min || '-'} - {stats.avg_age?.max || '-'} yrs
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Height: {stats.avg_height?.min || '-'} - {stats.avg_height?.max || '-'} cm
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.25rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Income Preference (Avg)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            {formatIncome(stats.avg_income?.min)} - {formatIncome(stats.avg_income?.max)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Annual Package Target</div>
                    </div>

                    <div className="card" style={{ padding: '1.25rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lifestyle Trend</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            1. {stats.lifestyle?.[0] || 'Any'} Drug Pref.
                        </div>
                        {stats.lifestyle?.[1] && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                2. {stats.lifestyle[1]}
                            </div>
                        )}
                    </div>
                </div>
             )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Age & Height</th>
                                    <th>Marital Status</th>
                                    <th>Community</th>
                                    <th>Professional Details</th>
                                    <th>Income</th>
                                    <th>Location Prefs</th>
                                    <th>Lifestyle</th>
                                    <th>Settings</th>
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
                                        <td>
                                            <div style={{ fontWeight: '600' }}>Age: {preference.min_age || 'Any'} - {preference.max_age || 'Any'}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                Ht: {(preference.min_height || preference.max_height) ? (
                                                    `${preference.min_height || 'Any'} - ${preference.max_height || 'Any'} cm`
                                                ) : 'Any'}
                                            </div>
                                        </td>
                                        <td>
                                            {preference.marital_status ? (
                                                <span className="badge" style={{ textTransform: 'capitalize' }}>
                                                    {['never_married', 'never married', 'single'].includes(preference.marital_status.toLowerCase().replace('_', ' ')) ? 'Single' : preference.marital_status.replace('_', ' ')}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{preference.religion_name || 'Any'}</div>
                                            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                                <strong>Caste:</strong> {formatArray(preference.caste_names)}
                                            </div>
                                            {preference.sub_caste_names?.length > 0 && (
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    <strong>Sub:</strong> {formatArray(preference.sub_caste_names)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>Edu: {formatArray(preference.education_names)}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Occ: {formatArray(preference.occupation_names)}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ whiteSpace: 'nowrap' }}>
                                                {formatIncome(preference.min_income)} - {formatIncome(preference.max_income)}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{formatArray(preference.preferred_locations)}</div>
                                            {preference.max_distance && (
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    Range: {preference.max_distance} km
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.82rem' }}>
                                                <div style={{ marginBottom: '2px' }}><strong>Drug:</strong> <span style={{ textTransform: 'capitalize' }}>{preference.drug_addiction || 'Any'}</span></div>
                                                <div style={{ marginBottom: '2px' }}><strong>Smoke:</strong> {formatArray(preference.smoke)}</div>
                                                <div><strong>Alcohol:</strong> {formatArray(preference.alcohol)}</div>
                                            </div>
                                        </td>
                                         <td>
                                            <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                                                <div style={{ marginBottom: '6px' }}><strong>Sort:</strong> <span style={{ textTransform: 'capitalize' }}>{preference.sort_by?.replace('_', ' ') || '-'}</span></div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {preference.hide_viewed && <span className="badge badge-secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-block' }}>Hide Viewed</span>}
                                                    {preference.hide_interested && <span className="badge badge-secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-block' }}>Hide Interested</span>}
                                                </div>
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
                        onPageChange={handlePageChange}
                        totalItems={totalItems}
                        itemsPerPage={15}
                    />
                </>
            )}
        </div>
    );
}