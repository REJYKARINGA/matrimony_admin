import { useEffect, useState } from 'react';
import api from '../api/axios';
import UserCell from '../components/UserCell';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { FaSearch, FaFilter, FaChevronDown, FaUsers, FaInfoCircle, FaUser } from 'react-icons/fa';

export default function FamilyDetails() {
    const [familyDetails, setFamilyDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const { showToast, ToastComponent } = useToast();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const activeFilterCount = search ? 1 : 0;

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

    const getBadgeClass = (value, positive = true) => {
        if (value === null || value === undefined) return '';
        if (positive) return value ? 'badge-verified' : 'badge-rejected';
        return value ? 'badge-rejected' : 'badge-verified';
    };

    return (
        <div className="family-details-page card" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <style>{`
.family-details-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
.family-details-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
.family-details-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
.family-details-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
.family-details-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
.family-details-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.family-details-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
.family-details-page .um-cards { display: none; }
.family-details-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
.family-details-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
.family-details-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
.family-details-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
.family-details-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
.family-details-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.family-details-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
.family-details-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
.family-details-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
.family-details-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
@keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
.family-details-page .um-filter-drawer { display: none; }
@media (max-width: 768px) {
  .family-details-page .table-container { display: none; }
  .family-details-page .um-cards { display: block; }
  .family-details-page .um-filter-toggle { display: inline-flex; }
  .family-details-page .filter-bar { display: none; }
  .family-details-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
  .family-details-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
  .family-details-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
}
@media (min-width: 769px) { .family-details-page .um-filter-drawer { display: none !important; } }
`}</style>

            <div className="um-toolbar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Family Details</h2>
                </div>
                <div className="um-search-row">
                    <div className="um-search-wrap">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search family details..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <button className="um-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
                        <FaFilter /> Filters {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                        <FaChevronDown size={10} style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                </div>
                <div className={`um-filter-drawer${filtersOpen ? ' open' : ''}`}>
                    <input
                        type="text"
                        placeholder="Search family details..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '1rem 0' }}>
                    {[1,2,3,4,5].map(i => <div key={i} className="um-skel-row" />)}
                </div>
            ) : familyDetails.length === 0 ? (
                <div className="um-empty">
                    <FaUsers />
                    <p>No family details found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
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
                                            {detail.user ? (
                                                <UserCell user={detail.user} profile={detail.user?.user_profile} />
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
                                                <span className="badge" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                                    {detail.family_status === 'rich' ? 'Upper Class' : detail.family_status.replace(/_/g, ' ')}
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

                    <div className="um-cards">
                        {familyDetails.map((detail) => (
                            <div key={detail.id} className="um-card">
                                <div className="um-card-top">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaUser style={{ color: 'var(--primary)' }} />
                                        <span style={{ fontWeight: 600 }}>
                                            {detail.user?.user_profile?.first_name
                                                ? `${detail.user.user_profile.first_name} ${detail.user.user_profile.last_name || ''}`
                                                : detail.user?.name || '-'}
                                        </span>
                                    </div>
                                    {detail.family_type && (
                                        <span className="badge" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                                            {detail.family_type}
                                        </span>
                                    )}
                                </div>
                                <dl className="um-card-grid">
                                    <div>
                                        <dt>Father</dt>
                                        <dd>{detail.father_name || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt>Mother</dt>
                                        <dd>{detail.mother_name || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt>Father Occupation</dt>
                                        <dd>{detail.father_occupation || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt>Mother Occupation</dt>
                                        <dd>{detail.mother_occupation || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt>Siblings</dt>
                                        <dd>{detail.siblings || 0}</dd>
                                    </div>
                                    <div>
                                        <dt>Family Status</dt>
                                        <dd>{detail.family_status ? (detail.family_status === 'rich' ? 'Upper Class' : detail.family_status.replace(/_/g, ' ')) : '-'}</dd>
                                    </div>
                                    <div>
                                        <dt>Location</dt>
                                        <dd>{detail.family_location || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt>Show</dt>
                                        <dd><span className={`badge ${getBadgeClass(detail.show)}`} style={{ fontSize: '0.7rem' }}>{formatBoolean(detail.show)}</span></dd>
                                    </div>
                                </dl>
                            </div>
                        ))}
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
            {ToastComponent}
        </div>
    );
}
