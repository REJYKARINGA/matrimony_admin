import { useEffect, useState } from 'react';
import { educationApi } from '../api/educationApi';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import TimeFormatCell from '../components/TimeFormatCell';

export default function Education() {
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        fetchEducations(1);
    }, [search]);

    const fetchEducations = async (page = 1) => {
        try {
            setLoading(true);
            const response = await educationApi.getAll({
                page,
                search
            });
            setEducations(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch educations', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchEducations(page);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await educationApi.create(formData);
            setFormData({ name: '' });
            setShowCreateForm(false);
            fetchEducations(currentPage); // Refresh current page
        } catch (error) {
            alert('Failed to create education');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await educationApi.update(editingItem.id, formData);
            setFormData({ name: '' });
            setEditingItem(null);
            fetchEducations(currentPage); // Refresh current page
        } catch (error) {
            alert('Failed to update education');
        }
    };

    const handleDelete = async () => {
        try {
            await educationApi.delete(confirmModal.id);
            fetchEducations(currentPage); // Refresh current page
        } catch (error) {
            alert('Failed to delete education');
        }
        setConfirmModal({ isOpen: false, id: null });
    };

    const openEditModal = (education) => {
        setEditingItem(education);
        setFormData({ name: education.name });
    };

    const closeModals = () => {
        setShowCreateForm(false);
        setEditingItem(null);
        setFormData({ name: '' });
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Education Management</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search education..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '300px', marginBottom: 0 }}
                    />
                </div>
            </div>

            {/* Create Education Modal */}
            {showCreateForm && (
                <div
                    onClick={closeModals}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                        overflowY: 'auto'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--card-bg)',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            width: '500px',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            margin: 'auto'
                        }}
                    >
                        <h3>Add New Education</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Education Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Education Modal */}
            {editingItem && (
                <div
                    onClick={closeModals}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                        overflowY: 'auto'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--card-bg)',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            width: '500px',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            margin: 'auto'
                        }}
                    >
                        <h3>Edit Education</h3>
                        <form onSubmit={handleUpdate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Education Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update
                                </button>
                            </div>
                        </form>
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
                                    <th>Name</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {educations.map((education) => (
                                    <tr key={education.id}>
                                        <td>{education.name}</td>
                                        <td><TimeFormatCell date={education.created_at} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>

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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Education"
                message="Are you sure you want to delete this education? This action cannot be undone."
            />
        </div>
    );
}