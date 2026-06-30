import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { interestApi } from '../api/interestApi';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { FaHeart, FaPlus, FaEdit, FaTrash, FaSearch, FaStar, FaFilter, FaListAlt, FaFolder, FaTags, FaTimes, FaChevronDown } from 'react-icons/fa';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function Interests() {
    const [activeTab, setActiveTab] = useState('interests'); // 'interests' or 'categories'
    const [interests, setInterests] = useState([]);
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
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, type: 'interest' });
    const [formData, setFormData] = useState({
        interest_name: '',
        interest_type: '',
        trending_number: 0,
        is_active: true
    });
    const [categoryName, setCategoryName] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const activeFilterCount = [search, selectedType].filter(v => v !== '').length;

    const fetchInterests = async (page = 1) => {
        try {
            setLoading(true);
            const response = await interestApi.getAll({
                page,
                search,
                type: selectedType,
                limit: 15
            });
            setInterests(response.data.data || []);
            setCurrentPage(response.data.current_page || 1);
            setTotalPages(response.data.last_page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch interests', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypes = async () => {
        try {
            const response = await interestApi.getTypes();
            setTypes(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch types', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'interests') {
            fetchInterests(1);
        }
        fetchTypes();
    }, [search, selectedType, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageChange = (page) => {
        fetchInterests(page);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await interestApi.update(editingItem.id, formData);
            } else {
                await interestApi.create(formData);
            }
            setShowForm(false);
            setEditingItem(null);
            setFormData({ interest_name: '', interest_type: '', trending_number: 0, is_active: true });
            if (activeTab === 'interests') fetchInterests(currentPage);
            fetchTypes();
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await interestApi.updateCategory({
                    old_type: editingCategory,
                    new_type: categoryName
                });
            } else {
                // To create a category, we add a first item
                await interestApi.create({
                    interest_name: 'First ' + categoryName + ' Item',
                    interest_type: categoryName,
                    trending_number: 0,
                    is_active: true
                });
            }
            setShowCategoryForm(false);
            setEditingCategory(null);
            setCategoryName('');
            fetchTypes();
            if (activeTab === 'interests') fetchInterests(1);
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async () => {
        try {
            if (confirmModal.type === 'category') {
                await interestApi.deleteCategory({ type: confirmModal.id });
                fetchTypes();
                if (activeTab === 'interests') fetchInterests(1);
            } else {
                await interestApi.delete(confirmModal.id);
                fetchInterests(currentPage);
            }
        } catch (error) {
            alert('Failed to delete');
        }
        setConfirmModal({ isOpen: false, id: null, type: 'interest' });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            interest_name: item.interest_name,
            interest_type: item.interest_type,
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
        <div className="interests-page">
            <style>{`
                .interests-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
                .interests-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
                .interests-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
                .interests-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
                .interests-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
                .interests-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
                .interests-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
                .interests-page .um-cards { display: none; }
                .interests-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
                .interests-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
                .interests-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
                .interests-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
                .interests-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
                .interests-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .interests-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
                .interests-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
                .interests-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
                .interests-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
                @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
                .interests-page .um-filter-drawer { display: none; }
                @media (max-width: 768px) {
                    .interests-page .table-container { display: none; }
                    .interests-page .um-cards { display: block; }
                    .interests-page .um-filter-toggle { display: inline-flex; }
                    .interests-page .filter-bar { display: none; }
                    .interests-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
                    .interests-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
                    .interests-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
                }
                @media (min-width: 769px) { .interests-page .um-filter-drawer { display: none !important; } }
            `}</style>
            {/* Header section with Tabs */}
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
                        <FaHeart /> Interests & Hobbies
                    </h1>
                    <div className="tabs-scroll" style={{ gap: '1rem', marginTop: '1rem' }}>
                        <button 
                            onClick={() => setActiveTab('interests')}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'interests' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'interests' ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaListAlt /> All Interests
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
                    onClick={activeTab === 'interests' ? () => setShowForm(true) : () => {
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
                    <FaPlus /> {activeTab === 'interests' ? 'Add Interest' : 'Add Category'}
                </motion.button>
            </motion.div>

            {activeTab === 'interests' ? (
                <>
                    {/* Filters and Search for Interests */}
                    <div className="um-toolbar">
                        <div className="um-search-row">
                            <div className="um-search-wrap">
                                <FaSearch />
                                <input type="text" placeholder="Search by name or category..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <button type="button" className="um-filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
                                {filtersOpen ? <FaTimes /> : <FaFilter />}
                                Filters
                                {activeFilterCount > 0 && <span className="um-filter-badge">{activeFilterCount}</span>}
                                <FaChevronDown style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                        </div>
                        <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`}>
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                <option value="">All Categories</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {activeFilterCount > 0 && (
                                <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSelectedType(''); }} style={{ justifyContent: 'center' }}>
                                    Clear filters
                                </button>
                            )}
                        </div>
                        <div className="filter-bar" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                <option value="">All Categories</option>
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {activeFilterCount > 0 && (
                                <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSelectedType(''); }} style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}>
                                    <FaTimes /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Interests Table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th style={{ textAlign: 'center' }}>Trending Rank</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ padding: 0, border: 'none' }}><div style={{ padding: '1rem' }}>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}</div></td></tr>
                                    ) : interests.length === 0 ? (
                                        <tr><td colSpan="5"><div className="um-empty"><FaHeart /><p style={{ margin: 0, fontWeight: 600 }}>No interests found</p><p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try adjusting your search or filters.</p></div></td></tr>
                                    ) : (
                                        interests.map((item) => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.interest_name}</td>
                                                <td>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.75rem', 
                                                        background: 'var(--info)20', 
                                                        color: 'var(--info)',
                                                        borderRadius: '20px',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {item.interest_type}
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
                                                        <motion.button whileHover={{ scale: 1.1, background: '#FEF2F2', color: '#EF4444' }} whileTap={{ scale: 0.9 }} onClick={() => setConfirmModal({ isOpen: true, id: item.id, type: 'interest' })} className="btn" style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}><FaTrash size={14} /></motion.button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!loading && interests.length > 0 && (
                            <div className="um-cards">
                                {interests.map((item) => (
                                    <div className="um-card" key={item.id}>
                                        <div className="um-card-top">
                                            <div style={{ fontWeight: 600 }}>{item.interest_name}</div>
                                            <span className={`badge ${item.is_active ? 'badge-verified' : 'badge-rejected'}`}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <dl className="um-card-grid">
                                            <div>
                                                <dt>Category</dt>
                                                <dd>{item.interest_type}</dd>
                                            </div>
                                            <div>
                                                <dt>Trending Rank</dt>
                                                <dd><FaStar color={item.trending_number <= 5 ? 'var(--warning)' : 'var(--text-secondary)'} size={12} style={{ marginRight: '0.25rem' }} />{item.trending_number}</dd>
                                            </div>
                                        </dl>
                                        <div className="um-card-actions">
                                            <button onClick={() => openEditModal(item)} className="btn btn-primary"><FaEdit /> Edit</button>
                                            <button onClick={() => setConfirmModal({ isOpen: true, id: item.id, type: 'interest' })} className="btn" style={{ border: '1px solid var(--border-color)', background: 'transparent' }}><FaTrash /> Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ padding: '1rem' }}>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={totalItems} itemsPerPage={15} />
                        </div>
                    </div>
                </>
            ) : (
                /* Categories Tab */
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
                    {types.map((type, index) => (
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
                                <FaTags size={60} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, textTransform: 'capitalize', color: 'var(--text)' }}>{type}</h3>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Category
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setActiveTab('interests');
                                    }}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--info)20', color: 'var(--info)' }}
                                    title="View Interests"
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
                    
                    {/* Add Category Card */}
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
                        <span>Add New Category</span>
                    </motion.div>
                </motion.div>
            )}

            {/* Interest Create/Edit Modal */}
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
                                {editingItem ? 'Edit Item' : 'Add New Interest/Hobby'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Name (e.g. Photography) *</label>
                                    <input type="text" value={formData.interest_name} onChange={(e) => setFormData({ ...formData, interest_name: e.target.value })} required placeholder="Enter name..." />
                                </div>
                                <div className="form-group">
                                    <label>Category (e.g. Creative, Outdoor) *</label>
                                    <input type="text" list="category-suggestions" value={formData.interest_type} onChange={(e) => setFormData({ ...formData, interest_type: e.target.value })} required placeholder="Enter category..." />
                                    <datalist id="category-suggestions">{types.map(t => <option key={t} value={t} />)}</datalist>
                                </div>
                                <div className="form-group">
                                    <label>Trending Score (Lower shows first)</label>
                                    <input type="number" value={formData.trending_number} onChange={(e) => setFormData({ ...formData, trending_number: parseInt(e.target.value) || 0 })} min="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-toggle">
                                        <div className="switch"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /><span className="slider"></span></div>
                                        Active Status
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

            {/* Category Rename/Create Modal */}
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
                                {editingCategory ? 'Rename Category' : 'Create New Category'}
                            </h3>
                            <form onSubmit={handleCategorySubmit}>
                                <div className="form-group">
                                    <label>Category Name *</label>
                                    <input
                                        type="text"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        required
                                        placeholder="e.g. Sports, Arts..."
                                        autoFocus
                                    />
                                    {editingCategory && (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                            ⚠️ This will update all interests currently in "{editingCategory}" to "{categoryName}".
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                    <button type="button" onClick={() => setShowCategoryForm(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingCategory ? 'Rename Globaly' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, type: 'interest' })}
                onConfirm={handleDelete}
                title={confirmModal.type === 'category' ? 'Delete Category' : 'Delete Interest'}
                message={confirmModal.type === 'category' 
                    ? `Are you ABSOLUTELY sure? This will delete the category "${confirmModal.id}" and ALL interests/hobbies inside it. This action cannot be undone.`
                    : "Are you sure you want to delete this interest? This action cannot be undone."}
            />
        </div>
    );
}
