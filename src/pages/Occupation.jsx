import { useEffect, useState } from 'react';
import { occupationApi } from '../api/occupationApi';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import TimeFormatCell from '../components/TimeFormatCell';

export default function Occupation() {
    const [occupations, setOccupations] = useState([]);
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
        fetchOccupations(1);
    }, [search]);

    const fetchOccupations = async (page = 1) => {
        try {
            setLoading(true);
            const response = await occupationApi.getAll({
                page,
                search
            });
            setOccupations(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (error) {
            console.error('Failed to fetch occupations', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchOccupations(page);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await occupationApi.create(formData);
            setFormData({ name: '' });
            setShowCreateForm(false);
            fetchOccupations(currentPage); // Refresh current page
        } catch (error) {
            alert('Failed to create occupation');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await occupationApi.update(editingItem.id, formData);
            setFormData({ name: '' });
            setEditingItem(null);
            fetchOccupations(currentPage); // Refresh current page
        } catch (error) {
            alert('Failed to update occupation');
        }
    };

    const handleDelete = async () => {
        try {
            await occupationApi.delete(confirmModal.id);
            fetchOccupations(currentPage); // Refresh current page
        } catch (error) {
            alert('Failed to delete occupation');
        }
        setConfirmModal({ isOpen: false, id: null });
    };

    const openEditModal = (occupation) => {
        setEditingItem(occupation);
        setFormData({ name: occupation.name });
    };

    const closeModals = () => {
        setShowCreateForm(false);
        setEditingItem(null);
        setFormData({ name: '' });
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Occupation Management</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search occupation..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '300px', marginBottom: 0 }}
                    />
                </div>
            </div>

            {/* Create Occupation Modal */}
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
                        padding: '1rem'
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
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <h3>Add New Occupation</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Occupation Name</label>
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

            {/* Edit Occupation Modal */}
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
                        padding: '1rem'
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
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        <h3>Edit Occupation</h3>
                        <form onSubmit={handleUpdate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Occupation Name</label>
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
                                {occupations.map((occupation) => (
                                    <tr key={occupation.id}>
                                        <td>{occupation.name}</td>
                                        <td><TimeFormatCell date={occupation.created_at} /></td>
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
                title="Delete Occupation"
                message="Are you sure you want to delete this occupation? This action cannot be undone."
            />
        </div>
    );
}