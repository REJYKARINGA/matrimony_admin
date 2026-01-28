import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FaCheckCircle } from 'react-icons/fa';
import Pagination from '../components/Pagination';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchReports(1);
    }, []);

    const fetchReports = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/reports', { params: { page } });
            setReports(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchReports(page);
    };

    const handleResolve = async (id) => {
        const notes = prompt('Resolution notes:');
        if (!notes) return;
        try {
            await api.post(`/admin/reports/${id}/resolve`, { resolution_notes: notes });
            fetchReports(currentPage);
        } catch (error) {
            alert('Failed to resolve');
        }
    };

    return (
        <div className="card">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>User Reports</h2>
            {loading ? (
                <p>Loading...</p>
            ) : reports.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No reports found.</p>
            ) : (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reporter</th>
                                    <th>Reported User</th>
                                    <th>Reason</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td>
                                            <div>{report.reporter?.user_profile?.first_name} (ID: {report.reporter?.matrimony_id})</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {report.reported_user?.user_profile?.first_name} (ID: {report.reported_user?.matrimony_id})
                                            </div>
                                        </td>
                                        <td>{report.reason}</td>
                                        <td>
                                            <div style={{ maxWidth: '300px', fontSize: '0.875rem' }}>{report.description || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${report.status === 'pending' ? 'badge-pending' : 'badge-verified'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>
                                            {report.status === 'pending' && (
                                                <button onClick={() => handleResolve(report.id)} className="btn btn-success" title="Resolve">
                                                    <FaCheckCircle /> Resolve
                                                </button>
                                            )}
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
                        itemsPerPage={10}
                    />
                </>
            )}
        </div>
    );
}
