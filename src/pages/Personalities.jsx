import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { personalityApi } from '../api/personalityApi';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { FaUserTag, FaPlus, FaEdit, FaTrash, FaSearch, FaStar, FaFilter, FaListAlt, FaFolder, FaTags, FaSmile } from 'react-icons/fa';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function Personalities() {
    const [activeTab, setActiveTab] = useState('personalities'); 
    const [personalities, setPersonalities] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, type: 'personality' });
    const [formData, setFormData] = useState({
        personality_name: '',
        personality_type: '',
        trending_number: 0,
        is_active: true
    });
    const [categoryName, setCategoryName] = useState('');

    const fetchPersonalities = async (page = 1) => {
        try {
            setLoading(true);
            const response = await personalityApi.getAll({
                page,
                search,
                type: selectedType,
                limit: 15
            });
            setPersonalities(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setTotalPages(response.data.last_page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch personalities', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypes = async () => {
        try {
            const response = await personalityApi.getTypes();
            setTypes(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch types', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'personalities') {
            fetchPersonalities(1);
        }
        fetchTypes();
    }, [search, selectedType, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageChange = (page) => {
        fetchPersonalities(page);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await personalityApi.update(editingItem.id, formData);
            } else {
                await personalityApi.create(formData);
            }
            setShowForm(false);
            setEditingItem(null);
            setFormData({ personality_name: '', personality_type: '', trending_number: 0, is_active: true });
            if (activeTab === 'personalities') fetchPersonalities(currentPage);
            fetchTypes();
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await personalityApi.updateCategory({
                    old_type: editingCategory,
                    new_type: categoryName
                });
            } else {
                await personalityApi.create({
                    personality_name: 'First ' + categoryName + ' Trait',
                    personality_type: categoryName,
                    trending_number: 0,
                    is_active: true
                });
            }
            setShowCategoryForm(false);
            setEditingCategory(null);
            setCategoryName('');
            fetchTypes();
            if (activeTab === 'personalities') fetchPersonalities(1);
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async () => {
        try {
            if (confirmModal.type === 'category') {
                await personalityApi.deleteCategory({ type: confirmModal.id });
                fetchTypes();
                if (activeTab === 'personalities') fetchPersonalities(1);
            } else {
                await personalityApi.delete(confirmModal.id);
                fetchPersonalities(currentPage);
            }
        } catch (error) {
            alert('Failed to delete');
        }
        setConfirmModal({ isOpen: false, id: null, type: 'personality' });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            personality_name: item.personality_name,
            personality_type: item.personality_type,
            trending_number: item.trending_number || 0,
            is_active: item.is_active !== false
        });
        setShowForm(true);
    };

    const openCategoryEditModal = (type) => {
        setEditingCategory(type);
        setCategoryName(type);
        setShowCategoryForm(true);
    };

    return (
        <div style={{ padding: 'min(1rem, 4vw)' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                        <FaSmile /> Personality Traits
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button 
                            onClick={() => setActiveTab('personalities')}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'personalities' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'personalities' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaListAlt /> All Traits
                        </button>
                        <button 
                            onClick={() => setActiveTab('categories')}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'categories' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'categories' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaFolder /> Manage Categories
                        </button>
                    </div>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={activeTab === 'personalities' ? () => setShowForm(true) : () => {
                        setEditingCategory(null);
                        setCategoryName('');
                        setShowCategoryForm(true);
                    }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px var(--primary)40'
                    }}
                >
                    <FaPlus /> {activeTab === 'personalities' ? 'Add Trait' : 'Add Category'}
                </motion.button>
            </motion.div>

            {activeTab === 'personalities' ? (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ 
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            marginBottom: '2rem',
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 4px 20px var(--shadow-color)'
                        }}
                    >
                        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search traits..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '40px', width: '100%', marginBottom: 0 }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaFilter color="var(--primary)" />
                            <select 
                                value={selectedType} 
                                onChange={(e) => setSelectedType(e.target.value)}
                                style={{ width: '200px', marginBottom: 0 }}
                            >
                                <option value="">All Categories</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </motion.div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Trait Name</th>
                                        <th>Category</th>
                                        <th style={{ textAlign: 'center' }}>Popularity</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
                                    ) : (
                                        personalities.map((item) => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.personality_name}</td>
                                                <td>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.75rem', 
                                                        background: 'var(--success)20', 
                                                        color: 'var(--success)',
                                                        borderRadius: '20px',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {item.personality_type}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                        <FaStar color={item.trending_number <= 5 ? 'var(--warning)' : 'var(--text-secondary)'} size={14} />
                                                        <span>{item.trending_number}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`badge ${item.is_active ? 'badge-verified' : 'badge-rejected'}`}>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditModal(item)} className="btn btn-primary" style={{ padding: '0.5rem', borderRadius: '8px' }}><FaEdit size={14} /></motion.button>
                                                        <motion.button whileHover={{ scale: 1.1, background: '#FEF2F2', color: '#EF4444' }} whileTap={{ scale: 0.9 }} onClick={() => setConfirmModal({ isOpen: true, id: item.id, type: 'personality' })} className="btn" style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}><FaTrash size={14} /></motion.button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalItems} itemsPerPage={15} />
                        </div>
                    </div>
                </>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '1.5rem' 
                    }}
                >
                    {types.map((type) => (
                        <motion.div 
                            key={type}
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            style={{
                                background: 'var(--card-bg)',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                                <FaUserTag size={60} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, textTransform: 'capitalize', color: 'var(--text)' }}>{type}</h3>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Trait Group
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setActiveTab('personalities');
                                    }}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--info)20', color: 'var(--info)' }}
                                    title="View Traits"
                                >
                                    <FaListAlt size={16} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => openCategoryEditModal(type)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem', borderRadius: '8px' }}
                                    title="Rename Category"
                                >
                                    <FaEdit size={16} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1, background: '#FEF2F2', color: '#EF4444' }}
                                    onClick={() => setConfirmModal({ isOpen: true, id: type, type: 'category' })}
                                    className="btn"
                                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                    title="Delete Category"
                                >
                                    <FaTrash size={16} />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                    
                    <motion.div 
                        variants={itemVariants}
                        onClick={() => {
                            setEditingCategory(null);
                            setCategoryName('');
                            setShowCategoryForm(true);
                        }}
                        whileHover={{ scale: 1.02 }}
                        style={{
                            background: 'transparent',
                            border: '2px dashed var(--border-color)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            minHeight: '100px'
                        }}
                    >
                        <FaPlus size={24} style={{ marginBottom: '0.5rem' }} />
                        <span>Add New Group</span>
                    </motion.div>
                </motion.div>
            )}

            {/* Trait Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowForm(false)}
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
                                background: 'var(--card-bg)', borderRadius: '20px',
                                padding: '2rem', width: '500px', maxWidth: '100%',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {editingItem ? <FaEdit color="var(--primary)" /> : <FaPlus color="var(--primary)" />}
                                {editingItem ? 'Edit Trait' : 'Add New Personality Trait'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Trait Name (e.g. Introvert) *</label>
                                    <input type="text" value={formData.personality_name} onChange={(e) => setFormData({ ...formData, personality_name: e.target.value })} required placeholder="Enter trait name..." />
                                </div>
                                <div className="form-group">
                                    <label>Group/Category (e.g. Social, Mind) *</label>
                                    <input type="text" list="category-suggestions" value={formData.personality_type} onChange={(e) => setFormData({ ...formData, personality_type: e.target.value })} required placeholder="Enter group..." />
                                    <datalist id="category-suggestions">{types.map(t => <option key={t} value={t} />)}</datalist>
                                </div>
                                <div className="form-group">
                                    <label>Order/Priority</label>
                                    <input type="number" value={formData.trending_number} onChange={(e) => setFormData({ ...formData, trending_number: parseInt(e.target.value) || 0 })} min="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-toggle">
                                        <div className="switch"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /><span className="slider"></span></div>
                                        Active
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                                    <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>{editingItem ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Modal */}
            <AnimatePresence>
                {showCategoryForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCategoryForm(false)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', zIndex: 1010, padding: '1rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)', borderRadius: '20px',
                                padding: '2rem', width: '450px', maxWidth: '100%',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {editingCategory ? <FaEdit color="var(--primary)" /> : <FaPlus color="var(--primary)" />}
                                {editingCategory ? 'Rename Group' : 'Create New Group'}
                            </h3>
                            <form onSubmit={handleCategorySubmit}>
                                <div className="form-group">
                                    <label>Group Name *</label>
                                    <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required placeholder="e.g. Behavioral, Emotional..." autoFocus />
                                    {editingCategory && (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                            Renaming will update all associated traits.
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setShowCategoryForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingCategory ? 'Rename Globaly' : 'Create Group'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, type: 'personality' })}
                onConfirm={handleDelete}
                title={confirmModal.type === 'category' ? 'Delete Group' : 'Delete Trait'}
                message={confirmModal.type === 'category' 
                    ? `Are you sure? This will delete the group "${confirmModal.id}" and ALL traits within it.`
                    : "Are you sure you want to delete this personality trait?"}
            />
        </div>
    );
}
