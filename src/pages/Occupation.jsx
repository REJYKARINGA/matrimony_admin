import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { occupationApi } from '../api/occupationApi';
import ConfirmModal from '../components/ConfirmModal';
import TimeFormatCell from '../components/TimeFormatCell';
import Pagination from '../components/Pagination';
import { FaBriefcase, FaPlus, FaEdit, FaTrash, FaSearch, FaChartBar, FaClock } from 'react-icons/fa';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

export default function Occupation() {
    const [occupations, setOccupations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', 
        is_active: true,
        order_number: 0,
        popularity_count: 0
    });
    const [editingItem, setEditingItem] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({
        totalOccupations: 0,
        activeOccupations: 0,
        recentlyAdded: 0,
        totalViews: 0
    });

    const fetchStats = async () => {
        try {
            const response = await occupationApi.getAll({ page: 1, limit: 1000 });
            const allOccupations = response.data.data || [];
            
            const totalOccupations = allOccupations.length;
            const activeOccupations = allOccupations.filter(occ => occ.is_active !== false).length;
            const recentlyAdded = allOccupations.filter(occ => {
                const createdAt = new Date(occ.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return createdAt > thirtyDaysAgo;
            }).length;
            
            setStats({
                totalOccupations,
                activeOccupations,
                recentlyAdded,
                totalViews: allOccupations.reduce((sum, occ) => sum + (occ.popularity_count || 0), 0)
            });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

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

    useEffect(() => {
        setMounted(true);
        fetchOccupations(1);
        fetchStats();
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageChange = (page) => {
        fetchOccupations(page);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await occupationApi.create(formData);
            setFormData({ name: '', is_active: true, order_number: 0, popularity_count: 0 });
            setShowCreateForm(false);
            fetchOccupations(currentPage);
            fetchStats();
        } catch (error) {
            alert('Failed to create occupation');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await occupationApi.update(editingItem.id, formData);
            setFormData({ name: '', is_active: true, order_number: 0, popularity_count: 0 });
            setEditingItem(null);
            fetchOccupations(currentPage);
            fetchStats();
        } catch (error) {
            alert('Failed to update occupation');
        }
    };

    const handleDelete = async () => {
        try {
            await occupationApi.delete(confirmModal.id);
            fetchOccupations(currentPage);
            fetchStats();
        } catch (error) {
            alert('Failed to delete occupation');
        }
        setConfirmModal({ isOpen: false, id: null });
    };

    const openEditModal = (occupation) => {
        setEditingItem(occupation);
        setFormData({ 
            name: occupation.name,
            is_active: occupation.is_active !== false,
            order_number: occupation.order_number || 0,
            popularity_count: occupation.popularity_count || 0
        });
    };

    const closeModals = () => {
        setShowCreateForm(false);
        setEditingItem(null);
        setFormData({ name: '', is_active: true, order_number: 0, popularity_count: 0 });
    };

    if (!mounted) return null;

    return (
        <div style={{ padding: 'min(1rem, 4vw)', position: 'relative' }}>
            {/* Animated Background */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%)
                    `,
                    pointerEvents: 'none',
                    zIndex: -1
                }}
                animate={{
                    background: [
                        `radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%)`,
                        `radial-gradient(circle at 30% 70%, var(--primary)30 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, var(--secondary)30 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, var(--primary)20 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, var(--secondary)20 0%, transparent 50%)`
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    marginBottom: '2rem',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <motion.div
                        animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            repeatDelay: 3 
                        }}
                    >
                        <FaBriefcase size={32} color="var(--primary)" />
                    </motion.div>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
                        fontWeight: 'bold', 
                        background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Occupation Management
                    </h1>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateForm(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        boxShadow: '0 4px 12px rgba(180, 127, 255, 0.3)'
                    }}
                >
                    <FaPlus /> Add Occupation
                </motion.button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                {[
                    { icon: FaBriefcase, label: 'Total Occupations', value: stats.totalOccupations, color: 'var(--primary)' },
                    { icon: FaBriefcase, label: 'Active Occupations', value: stats.activeOccupations, color: '#10B981' },
                    { icon: FaClock, label: 'Recently Added', value: stats.recentlyAdded, color: '#3B82F6' },
                    { icon: FaChartBar, label: 'Total Usage', value: stats.totalViews, color: '#F59E0B' }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px var(--shadow-color)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                            background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`, 
                            filter: 'blur(20px)' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <stat.icon size={24} color={stat.color} style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text)' }}>
                                {stat.value.toLocaleString()}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Table Card */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Occupation List</h3>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search occupations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ 
                                paddingLeft: '40px',
                                width: 'min(300px, 100%)',
                                marginBottom: 0
                            }}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }}>Order</th>
                                <th style={{ textAlign: 'center' }}>Popularity</th>
                                <th>Created At</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                            ) : occupations.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No occupations found</td></tr>
                            ) : (
                                occupations.map((occupation) => (
                                    <tr key={occupation.id}>
                                        <td style={{ fontWeight: '600' }}>{occupation.name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`badge ${occupation.is_active !== false ? 'badge-verified' : 'badge-rejected'}`}>
                                                {occupation.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{occupation.order_number || 0}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                                <FaChartBar size={12} color="var(--text-secondary)" />
                                                {occupation.popularity_count || 0}
                                            </div>
                                        </td>
                                        <td><TimeFormatCell date={occupation.created_at} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => openEditModal(occupation)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.5rem', borderRadius: '8px' }}
                                                    title="Edit"
                                                >
                                                    <FaEdit size={14} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: '#FEF2F2', color: '#EF4444' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setConfirmModal({ isOpen: true, id: occupation.id })}
                                                    className="btn btn-danger"
                                                    style={{ padding: '0.5rem', borderRadius: '8px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                                                    title="Delete"
                                                >
                                                    <FaTrash size={14} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '1rem' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalItems}
                        itemsPerPage={15}
                    />
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(showCreateForm || editingItem) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModals}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)', borderRadius: '16px',
                                padding: '2rem', width: '500px', maxWidth: '100%',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {editingItem ? <FaEdit color="var(--primary)" /> : <FaPlus color="var(--primary)" />}
                                {editingItem ? 'Edit Occupation' : 'Add New Occupation'}
                            </h3>
                            <form onSubmit={editingItem ? handleUpdate : handleCreate}>
                                <div className="form-group">
                                    <label>Occupation Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Software Engineer"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Order Number</label>
                                        <input
                                            type="number"
                                            value={formData.order_number}
                                            onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Popularity Count</label>
                                        <input
                                            type="number"
                                            value={formData.popularity_count}
                                            onChange={(e) => setFormData({ ...formData, popularity_count: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-toggle">
                                        <div className="switch">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            <span className="slider"></span>
                                        </div>
                                        Active Status
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                    <button type="button" onClick={closeModals} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingItem ? 'Update Occupation' : 'Create Occupation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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