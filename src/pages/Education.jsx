import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { educationApi } from '../api/educationApi';
import ConfirmModal from '../components/ConfirmModal';
import TimeFormatCell from '../components/TimeFormatCell';
import { FaGraduationCap, FaPlus, FaEdit, FaTrash, FaSearch, FaBook, FaChartBar, FaClock } from 'react-icons/fa';

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

export default function Education() {
    const [educations, setEducations] = useState([]);
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
        totalEducations: 0,
        activeEducations: 0,
        recentlyAdded: 0,
        totalViews: 0
    });

    const fetchStats = async () => {
        try {
            // Calculate stats from existing data since no API exists
            const response = await educationApi.getAll({ page: 1, limit: 1000 });
            const allEducations = response.data.data || [];
            
            const totalEducations = allEducations.length;
            const activeEducations = allEducations.filter(edu => edu.is_active !== false).length;
            const recentlyAdded = allEducations.filter(edu => {
                const createdAt = new Date(edu.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return createdAt > thirtyDaysAgo;
            }).length;
            
            setStats({
                totalEducations,
                activeEducations,
                recentlyAdded,
                totalViews: allEducations.reduce((sum, edu) => sum + (edu.popularity_count || 0), 0)
            });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

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

    useEffect(() => {
        setMounted(true);
        fetchEducations(1);
        fetchStats();
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageChange = (page) => {
        fetchEducations(page);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await educationApi.create(formData);
            setFormData({ name: '', is_active: true, order_number: 0, popularity_count: 0 });
            setShowCreateForm(false);
            fetchEducations(currentPage);
            fetchStats();
        } catch (error) {
            alert('Failed to create education');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await educationApi.update(editingItem.id, formData);
            setFormData({ name: '', is_active: true, order_number: 0, popularity_count: 0 });
            setEditingItem(null);
            fetchEducations(currentPage);
            fetchStats();
        } catch (error) {
            alert('Failed to update education');
        }
    };

    const handleDelete = async () => {
        try {
            await educationApi.delete(confirmModal.id);
            fetchEducations(currentPage);
            fetchStats();
        } catch (error) {
            alert('Failed to delete education');
        }
        setConfirmModal({ isOpen: false, id: null });
    };

    const openEditModal = (education) => {
        setEditingItem(education);
        setFormData({ 
            name: education.name,
            is_active: education.is_active !== false,
            order_number: education.order_number || 0,
            popularity_count: education.popularity_count || 0
        });
    };

    const closeModals = () => {
        setShowCreateForm(false);
        setEditingItem(null);
        setFormData({ name: '', is_active: true, order_number: 0, popularity_count: 0 });
    };

    if (!mounted) return null;

    return (
        <div style={{ padding: '2rem', position: 'relative' }}>
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
                        <FaGraduationCap size={32} color="var(--primary)" />
                    </motion.div>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Education Management
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
                    <FaPlus /> Add Education
                </motion.button>
            </motion.div>

            {/* Stats Cards - Responsive Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--primary)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaGraduationCap size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Educations
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {stats.totalEducations.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--success)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaBook size={24} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Active Educations
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {stats.activeEducations.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--info)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaClock size={24} color="var(--info)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Recently Added
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {stats.recentlyAdded.toLocaleString()}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', 
                        background: 'radial-gradient(circle, var(--warning)30 0%, transparent 70%)', 
                        filter: 'blur(20px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <FaChartBar size={24} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Total Views
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {stats.totalViews.toLocaleString()}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Controls - Responsive Layout */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                {/* Mobile-friendly title */}
                <h2 style={{ 
                    margin: 0, 
                    color: 'var(--text-primary)',
                    fontSize: 'clamp(1rem, 4vw, 1.5rem)'
                }}>
                    Education List
                </h2>
                
                <div style={{ 
                    display: 'flex', 
                    gap: '0.75rem', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search educations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ 
                                paddingLeft: '40px',
                                width: 'clamp(200px, 40vw, 300px)',
                                marginBottom: 0,
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem 0.75rem 40px'
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Create Education Modal */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: 'clamp(1rem, 4vw, 2rem)',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                margin: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <FaGraduationCap size={24} color="var(--primary)" />
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                                    Add New Education
                                </h3>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        Education Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Enter education name"
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem 1rem', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        Order Number
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order_number}
                                        onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) || 0 })}
                                        placeholder="Enter order number"
                                        min="0"
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem 1rem', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        Popularity Count
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.popularity_count}
                                        onChange={(e) => setFormData({ ...formData, popularity_count: parseInt(e.target.value) || 0 })}
                                        placeholder="Enter popularity count"
                                        min="0"
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem 1rem', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            style={{ 
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer',
                                                accentColor: 'var(--primary)'
                                            }}
                                        />
                                        Active Status
                                    </label>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '0.75rem', 
                                    justifyContent: 'flex-end',
                                    flexWrap: 'wrap'
                                }}>
                                    <motion.button
                                        type="button"
                                        onClick={closeModals}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                                            minWidth: '80px'
                                        }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                                            fontWeight: '500',
                                            minWidth: '80px'
                                        }}
                                    >
                                        Create
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Education Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: 'clamp(1rem, 4vw, 2rem)',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                margin: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <FaEdit size={24} color="var(--primary)" />
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                                    Edit Education
                                </h3>
                            </div>
                            <form onSubmit={handleUpdate}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        Education Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Enter education name"
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem 1rem', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        Order Number
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order_number}
                                        onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) || 0 })}
                                        placeholder="Enter order number"
                                        min="0"
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem 1rem', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        Popularity Count
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.popularity_count}
                                        onChange={(e) => setFormData({ ...formData, popularity_count: parseInt(e.target.value) || 0 })}
                                        placeholder="Enter popularity count"
                                        min="0"
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem 1rem', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text)',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            style={{ 
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer',
                                                accentColor: 'var(--primary)'
                                            }}
                                        />
                                        Active Status
                                    </label>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '0.75rem', 
                                    justifyContent: 'flex-end',
                                    flexWrap: 'wrap'
                                }}>
                                    <motion.button
                                        type="button"
                                        onClick={closeModals}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                                            minWidth: '80px'
                                        }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                                            fontWeight: '500',
                                            minWidth: '80px'
                                        }}
                                    >
                                        Update
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Education Table */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px var(--shadow-color)',
                    overflow: 'hidden'
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'inline-block' }}
                        >
                            <FaGraduationCap size={32} color="var(--primary)" />
                        </motion.div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading educations...</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse',
                                minWidth: '800px'
                            }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>
                                            <FaGraduationCap style={{ marginRight: '0.5rem' }} />
                                            Education
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>
                                            Status
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>
                                            Order
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>
                                            Popularity
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>
                                            <FaClock style={{ marginRight: '0.5rem' }} />
                                            Created At
                                        </th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {educations.map((education, index) => (
                                            <motion.tr
                                                key={education.id}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit={{ opacity: 0, x: -100 }}
                                                whileHover={{ 
                                                    backgroundColor: 'var(--hover-bg)',
                                                    scale: 1.01
                                                }}
                                                transition={{ delay: index * 0.05 }}
                                                style={{
                                                    borderBottom: '1px solid var(--border-color)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                        {education.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                        ID: {education.id}
                                                    </div>
                                                </td>
                                                
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        background: education.is_active 
                                                            ? 'var(--success)20' 
                                                            : 'var(--danger)20',
                                                        color: education.is_active 
                                                            ? 'var(--success)' 
                                                            : 'var(--danger)',
                                                        display: 'inline-block'
                                                    }}>
                                                        {education.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '8px',
                                                        background: 'var(--info)20',
                                                        color: 'var(--info)',
                                                        fontWeight: '500'
                                                    }}>
                                                        #{education.order_number}
                                                    </span>
                                                </td>
                                                
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <FaChartBar size={14} color="var(--warning)" />
                                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                            {education.popularity_count || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                        <TimeFormatCell date={education.created_at} />
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                        <TimeFormatCell date={education.updated_at} prefix="Updated: " />
                                                    </div>
                                                </td>
                                                
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        gap: '0.5rem', 
                                                        justifyContent: 'center',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => openEditModal(education)}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: 'var(--primary)20',
                                                                color: 'var(--primary)',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Edit Education"
                                                        >
                                                            <FaEdit size={14} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => setConfirmModal({ isOpen: true, id: education.id })}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: 'var(--danger)20',
                                                                color: 'var(--danger)',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Delete Education"
                                                        >
                                                            <FaTrash size={14} />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {educations.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <FaGraduationCap size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>No educations found</p>
                            </div>
                        )}

                        {/* Responsive Pagination */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            marginTop: '1.5rem',
                            padding: '1rem',
                            borderTop: '1px solid var(--border-color)',
                            flexWrap: 'wrap'
                        }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text)',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                Previous
                            </motion.button>

                            <span style={{ 
                                padding: '0.5rem 1rem',
                                background: 'var(--primary)',
                                color: 'white',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}>
                                {currentPage} / {totalPages}
                            </span>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text)',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                Next
                            </motion.button>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Summary */}
            {totalItems > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        textAlign: 'center',
                        marginTop: '1rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                    }}
                >
                    Showing {educations.length} of {totalItems} educations
                </motion.div>
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