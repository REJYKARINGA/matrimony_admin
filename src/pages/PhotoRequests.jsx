import { useEffect, useState } from 'react';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import TimeFormatCell from '../components/TimeFormatCell';
import { FaCamera, FaSearch, FaHistory, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';
import { useToast } from '../components/Toast';
import UserCell from '../components/UserCell';

export default function PhotoRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { showToast, ToastComponent } = useToast();

    const activeFilterCount = statusFilter !== 'all' ? 1 : 0;

    useEffect(() => {
        fetchRequests(1);
    }, [search, statusFilter]);

    const fetchRequests = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/photo-requests', {
                params: {
                    search: search || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    page
                }
            });
            setRequests(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch photo requests', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted': return <span className="badge badge-verified">Accepted</span>;
            case 'rejected': return <span className="badge badge-rejected">Rejected</span>;
            case 'pending': return <span className="badge badge-warning">Pending</span>;
            default: return <span className="badge badge-secondary">{status}</span>;
        }
    };

    return (
        <div className="photo-requests-page">
            <style>{`
                .photo-requests-page .um-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    background: var(--card-bg);
                    padding-bottom: 0.5rem;
                }
                .photo-requests-page .um-search-row {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 1rem;
                }
                .photo-requests-page .um-search-wrap {
                    position: relative;
                    flex: 1 1 260px;
                    min-width: 0;
                }
                .photo-requests-page .um-search-wrap svg {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
                .photo-requests-page .um-search-wrap input {
                    width: 100%;
                    padding-left: 2.25rem;
                    margin-bottom: 0;
                    box-sizing: border-box;
                }
                .photo-requests-page .um-filter-toggle {
                    display: none;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1.5px solid var(--border-color);
                    background: var(--card-bg);
                    color: var(--text);
                    border-radius: 10px;
                    padding: 0.55rem 0.9rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .photo-requests-page .um-filter-badge {
                    background: var(--primary);
                    color: white;
                    border-radius: 9999px;
                    font-size: 0.68rem;
                    min-width: 18px;
                    height: 18px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 5px;
                }
                .photo-requests-page .um-cards { display: none; }
                .photo-requests-page .um-card {
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 1rem;
                    margin-bottom: 0.85rem;
                    background: var(--card-bg);
                }
                .photo-requests-page .um-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .photo-requests-page .um-card-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem 0.75rem;
                    font-size: 0.8rem;
                    margin-bottom: 0.85rem;
                }
                .photo-requests-page .um-card-grid dt {
                    color: var(--text-secondary);
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.15rem;
                }
                .photo-requests-page .um-card-grid dd {
                    margin: 0;
                    font-weight: 500;
                    word-break: break-word;
                }
                .photo-requests-page .um-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .photo-requests-page .um-card-actions .btn {
                    flex: 1 1 auto;
                    justify-content: center;
                    padding: 0.55rem 0.75rem;
                }
                .photo-requests-page .um-empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: var(--text-secondary);
                }
                .photo-requests-page .um-empty svg {
                    font-size: 2rem;
                    margin-bottom: 0.75rem;
                    opacity: 0.5;
                }
                .photo-requests-page .um-skel-row {
                    height: 56px;
                    border-radius: 10px;
                    margin-bottom: 0.6rem;
                    background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%);
                    background-size: 400% 100%;
                    animation: um-shimmer 1.4s ease infinite;
                }
                @keyframes um-shimmer {
                    0% { background-position: 100% 50%; }
                    100% { background-position: 0 50%; }
                }
                .photo-requests-page .um-filter-drawer {
                    display: none;
                }
                @media (max-width: 768px) {
                    .photo-requests-page .um-table-wrap { display: none; }
                    .photo-requests-page .um-cards { display: block; }
                    .photo-requests-page .um-filter-toggle { display: inline-flex; }
                    .photo-requests-page .filter-bar { display: none; }
                    .photo-requests-page .um-card-grid { grid-template-columns: 1fr; }
                    .photo-requests-page .um-filter-drawer.open {
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        background: var(--hover-bg);
                    }
                    .photo-requests-page .um-filter-drawer select {
                        width: 100%;
                        appearance: none;
                        -webkit-appearance: none;
                        background-color: var(--card-bg);
                        color: var(--text);
                        border: 1.5px solid var(--border-color);
                        border-radius: 10px;
                        padding: 0.7rem 2.25rem 0.7rem 0.9rem;
                        font-size: 0.85rem;
                        font-weight: 500;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-position: right 0.85rem center;
                        background-size: 1.1rem;
                    }
                    .photo-requests-page .um-filter-drawer select:focus {
                        outline: none;
                        border-color: var(--primary);
                        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18);
                    }
                }
                @media (min-width: 769px) {
                    .photo-requests-page .um-filter-drawer { display: none !important; }
                }
            `}</style>

            <div className="card">
                <div className="um-toolbar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '45px', height: '45px', borderRadius: '12px',
                                background: 'rgba(var(--primary-rgb), 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)', fontSize: '1.2rem'
                            }}>
                                <FaCamera />
                            </div>
                            <div>
                                <h2 style={{ margin: 0 }}>Photo Status Monitoring</h2>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monitoring photo access requests for safety</p>
                            </div>
                        </div>
                    </div>

                    <div className="um-search-row">
                        <div className="um-search-wrap">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="um-filter-toggle"
                            onClick={() => setFiltersOpen(o => !o)}
                        >
                            {filtersOpen ? <FaTimes /> : <FaFilter />}
                            Filters
                            {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                            <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                    </div>

                    <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('all')} style={{ justifyContent: 'center' }}>
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="filter-bar" style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Status: All</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        {activeFilterCount > 0 && (
                            <button type="button" className="btn btn-secondary" onClick={() => setStatusFilter('all')} style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                                <FaTimes /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div>
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="um-empty">
                        <FaHistory />
                        <p style={{ margin: 0, fontWeight: 600 }}>No photo requests found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrap">
                            <div className="table-container" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Requester</th>
                                            <th>Receiver</th>
                                            <th>Status</th>
                                            <th>Requested On</th>
                                            <th>Last Update</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request) => (
                                            <tr key={request.id}>
                                                <td>
                                                    <UserCell user={request.requester} profile={request.requester?.user_profile} />
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <UserCell user={request.receiver} profile={request.receiver?.user_profile} />
                                                        {request.receiver?.user_profile?.gender === 'female' && (
                                                            <span style={{ fontSize: '0.7rem', background: 'rgba(244, 114, 182, 0.1)', color: '#f472b6', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', width: 'fit-content' }}>Women Protection Active</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{getStatusBadge(request.status)}</td>
                                                <td>
                                                    <TimeFormatCell date={request.created_at} />
                                                </td>
                                                <td>
                                                    <TimeFormatCell date={request.updated_at} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="um-cards">
                            {requests.map((request) => (
                                <div className="um-card" key={request.id}>
                                    <div className="um-card-top">
                                        <UserCell user={request.requester} profile={request.requester?.user_profile} />
                                        {getStatusBadge(request.status)}
                                    </div>
                                    <dl className="um-card-grid">
                                        <div>
                                            <dt>Receiver</dt>
                                            <dd>
                                                <UserCell user={request.receiver} profile={request.receiver?.user_profile} />
                                                {request.receiver?.user_profile?.gender === 'female' && (
                                                    <span style={{ fontSize: '0.65rem', background: 'rgba(244, 114, 182, 0.1)', color: '#f472b6', padding: '2px 5px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>Women Protection Active</span>
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Requested On</dt>
                                            <dd><TimeFormatCell date={request.created_at} /></dd>
                                        </div>
                                        <div>
                                            <dt>Last Update</dt>
                                            <dd><TimeFormatCell date={request.updated_at} /></dd>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={fetchRequests}
                            totalItems={totalItems}
                            itemsPerPage={15}
                        />
                    </>
                )}
                {ToastComponent}
            </div>
        </div>
    );
}
