import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { religionApi } from '../api/religionApi';
import ConfirmModal from '../components/ConfirmModal';
import { FaMosque, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';

export default function ReligionManagement() {
    const [religions, setReligions] = useState([]);
    const [castes, setCastes] = useState([]);
    const [subCastes, setSubCastes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('religions'); // religions, castes, subcastes
    const [expandedReligions, setExpandedReligions] = useState({});
    const [expandedCastes, setExpandedCastes] = useState({});

    // Form states
    const [showCreateReligion, setShowCreateReligion] = useState(false);
    const [showCreateCaste, setShowCreateCaste] = useState(false);
    const [showCreateSubCaste, setShowCreateSubCaste] = useState(false);
    const [religionForm, setReligionForm] = useState({ name: '', is_active: true, order_number: 0 });
    const [casteForm, setCasteForm] = useState({ religion_id: '', name: '', is_active: true, order_number: 0 });
    const [subCasteForm, setSubCasteForm] = useState({ caste_id: '', name: '', is_active: true, order_number: 0 });
    const [editingReligion, setEditingReligion] = useState(null);
    const [editingCaste, setEditingCaste] = useState(null);
    const [editingSubCaste, setEditingSubCaste] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [religionsRes, castesRes, subCastesRes] = await Promise.all([
                religionApi.getAllReligions({ limit: 1000 }),
                religionApi.getAllCastes({ limit: 1000 }),
                religionApi.getAllSubCastes({ limit: 1000 })
            ]);
            setReligions(religionsRes.data.data || []);
            setCastes(castesRes.data.data || []);
            setSubCastes(subCastesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateReligion = async (e) => {
        e.preventDefault();
        try {
            await religionApi.createReligion(religionForm);
            setReligionForm({ name: '', is_active: true, order_number: 0 });
            setShowCreateReligion(false);
            fetchData();
        } catch (error) {
            alert('Failed to create religion');
        }
    };

    const handleUpdateReligion = async (e) => {
        e.preventDefault();
        try {
            await religionApi.updateReligion(editingReligion.id, religionForm);
            setReligionForm({ name: '', is_active: true, order_number: 0 });
            setEditingReligion(null);
            fetchData();
        } catch (error) {
            alert('Failed to update religion');
        }
    };

    const handleCreateCaste = async (e) => {
        e.preventDefault();
        try {
            await religionApi.createCaste(casteForm);
            setCasteForm({ religion_id: '', name: '', is_active: true, order_number: 0 });
            setShowCreateCaste(false);
            fetchData();
        } catch (error) {
            alert('Failed to create caste');
        }
    };

    const handleUpdateCaste = async (e) => {
        e.preventDefault();
        try {
            await religionApi.updateCaste(editingCaste.id, casteForm);
            setCasteForm({ religion_id: '', name: '', is_active: true, order_number: 0 });
            setEditingCaste(null);
            fetchData();
        } catch (error) {
            alert('Failed to update caste');
        }
    };

    const handleCreateSubCaste = async (e) => {
        e.preventDefault();
        try {
            await religionApi.createSubCaste(subCasteForm);
            setSubCasteForm({ caste_id: '', name: '', is_active: true, order_number: 0 });
            setShowCreateSubCaste(false);
            fetchData();
        } catch (error) {
            alert('Failed to create sub-caste');
        }
    };

    const handleUpdateSubCaste = async (e) => {
        e.preventDefault();
        try {
            await religionApi.updateSubCaste(editingSubCaste.id, subCasteForm);
            setSubCasteForm({ caste_id: '', name: '', is_active: true, order_number: 0 });
            setEditingSubCaste(null);
            fetchData();
        } catch (error) {
            alert('Failed to update sub-caste');
        }
    };

    const handleDelete = async () => {
        try {
            if (confirmModal.type === 'religion') {
                await religionApi.deleteReligion(confirmModal.id);
            } else if (confirmModal.type === 'caste') {
                await religionApi.deleteCaste(confirmModal.id);
            } else if (confirmModal.type === 'subcaste') {
                await religionApi.deleteSubCaste(confirmModal.id);
            }
            fetchData();
        } catch (error) {
            alert(`Failed to delete ${confirmModal.type}`);
        }
        setConfirmModal({ isOpen: false, type: '', id: null });
    };

    const toggleReligion = (id) => {
        setExpandedReligions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleCaste = (id) => {
        setExpandedCastes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getCastesByReligion = (religionId) => {
        return castes.filter(c => c.religion_id === religionId);
    };

    const getSubCastesByCaste = (casteId) => {
        return subCastes.filter(sc => sc.caste_id === casteId);
    };

    const getReligionName = (id) => {
        return religions.find(r => r.id === id)?.name || 'Unknown';
    };

    const getCasteName = (id) => {
        return castes.find(c => c.id === id)?.name || 'Unknown';
    };

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaMosque size={32} color="var(--primary)" />
                    <h1 style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Religion & Community Management
                    </h1>
                </div>
            </motion.div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px var(--shadow-color)'
                    }}
                >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Total Religions
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {religions.length}
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px var(--shadow-color)'
                    }}
                >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Total Castes
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {castes.length}
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 4px 24px var(--shadow-color)'
                    }}
                >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Total Sub-Castes
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {subCastes.length}
                    </div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--border-color)',
                flexWrap: 'wrap'
            }}>
                {['religions', 'castes', 'subcastes'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === tab ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text)',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500',
                            transition: 'all 0.3s',
                            borderRadius: '8px 8px 0 0',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'religions' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Religions</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateReligion(true)}
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
                                fontWeight: '500'
                            }}
                        >
                            <FaPlus /> Add Religion
                        </motion.button>
                    </div>

                    {/* Table-style Hierarchical View */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', overflowX: 'auto' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'flex',
                            padding: '0.75rem 1rem',
                            borderBottom: '2px solid var(--border-color)',
                            marginBottom: '1rem',
                            minWidth: '700px'
                        }}>
                            <div style={{ flex: 2, fontWeight: 'bold', color: 'var(--text-primary)' }}>Religion Type / Community</div>
                            <div style={{ width: '120px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>Order Number</div>
                            <div style={{ width: '120px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>Status</div>
                            <div style={{ width: '120px', fontWeight: 'bold', textAlign: 'right', color: 'var(--text-primary)' }}>Actions</div>
                        </div>

                        {religions.map(religion => (
                            <div key={religion.id} style={{ marginBottom: '0.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--input-bg)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    minWidth: '700px'
                                }}>
                                    {/* Religion Name Column */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 2 }}>
                                        <button
                                            onClick={() => toggleReligion(religion.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.25rem',
                                                color: 'var(--text-primary)',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {expandedReligions[religion.id] ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                                        </button>
                                        <FaMosque color="var(--primary)" size={18} />
                                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{religion.name}</span>
                                    </div>

                                    {/* Religion Order Number Column */}
                                    <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            background: 'var(--secondary)',
                                            color: 'var(--text-primary)',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            #{religion.order_number || 0}
                                        </span>
                                    </div>

                                    {/* Religion Status Column */}
                                    <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: religion.is_active ? 'var(--success)' : 'var(--danger)',
                                            color: 'white',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {religion.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {/* Religion Actions Column */}
                                    <div style={{ width: '120px', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => {
                                                setEditingReligion(religion);
                                                setReligionForm({
                                                    name: religion.name,
                                                    is_active: religion.is_active,
                                                    order_number: religion.order_number || 0
                                                });
                                            }}
                                            style={{
                                                padding: '0.4rem',
                                                background: 'var(--info)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaEdit size={14} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => setConfirmModal({ isOpen: true, type: 'religion', id: religion.id })}
                                            style={{
                                                padding: '0.4rem',
                                                background: 'var(--danger)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaTrash size={14} />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Castes under this religion */}
                                {expandedReligions[religion.id] && (
                                    <div style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                                        {getCastesByReligion(religion.id).map(caste => (
                                            <div key={caste.id} style={{ marginBottom: '0.25rem' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '0.6rem 1rem',
                                                    background: 'var(--card-bg)',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--border-color)',
                                                    minWidth: 'calc(700px - 1.5rem)'
                                                }}>
                                                    {/* Caste Name Column */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 2 }}>
                                                        <button
                                                            onClick={() => toggleCaste(caste.id)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '0.2rem',
                                                                color: 'var(--text-primary)',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            {expandedCastes[caste.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                                                        </button>
                                                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{caste.name}</span>
                                                    </div>

                                                    {/* Caste Order Column */}
                                                    <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                                        <span style={{
                                                            padding: '0.15rem 0.4rem',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            color: 'var(--text-secondary)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: '600',
                                                            border: '1px solid var(--border-color)'
                                                        }}>
                                                            #{caste.order_number || 0}
                                                        </span>
                                                    </div>

                                                    {/* Caste Status Column */}
                                                    <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                                        <span style={{
                                                            padding: '0.15rem 0.5rem',
                                                            background: caste.is_active ? 'var(--success)' : 'var(--danger)',
                                                            opacity: 0.8,
                                                            color: 'white',
                                                            borderRadius: '10px',
                                                            fontSize: '0.65rem'
                                                        }}>
                                                            {caste.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>

                                                    {/* Caste Actions Column */}
                                                    <div style={{ width: '120px', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            onClick={() => {
                                                                setEditingCaste(caste);
                                                                setCasteForm({
                                                                    religion_id: caste.religion_id,
                                                                    name: caste.name,
                                                                    is_active: caste.is_active,
                                                                    order_number: caste.order_number || 0
                                                                });
                                                            }}
                                                            style={{
                                                                padding: '0.3rem',
                                                                background: 'var(--info)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FaEdit size={12} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            onClick={() => setConfirmModal({ isOpen: true, type: 'caste', id: caste.id })}
                                                            style={{
                                                                padding: '0.3rem',
                                                                background: 'var(--danger)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FaTrash size={12} />
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                {/* Sub-castes under this caste */}
                                                {expandedCastes[caste.id] && (
                                                    <div style={{ marginLeft: '1.5rem', marginTop: '0.2rem' }}>
                                                        {getSubCastesByCaste(caste.id).map(subCaste => (
                                                            <div key={subCaste.id} style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                padding: '0.4rem 1rem',
                                                                background: 'var(--input-bg)',
                                                                borderRadius: '4px',
                                                                marginBottom: '0.15rem',
                                                                fontSize: '0.85rem',
                                                                minWidth: 'calc(700px - 3rem)',
                                                                border: '1px solid var(--border-color)'
                                                            }}>
                                                                {/* Subcaste Name Column */}
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 2 }}>
                                                                    <span style={{ color: 'var(--text-secondary)', marginLeft: '1rem' }}>• {subCaste.name}</span>
                                                                </div>

                                                                {/* Subcaste Order Number Column */}
                                                                <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                                                    <span style={{
                                                                        padding: '0.1rem 0.3rem',
                                                                        color: 'var(--text-secondary)',
                                                                        fontSize: '0.6rem',
                                                                        opacity: 0.7
                                                                    }}>
                                                                        #{subCaste.order_number || 0}
                                                                    </span>
                                                                </div>

                                                                {/* Subcaste Status Column */}
                                                                <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                                                                    <div style={{
                                                                        width: '6px',
                                                                        height: '6px',
                                                                        borderRadius: '50%',
                                                                        background: subCaste.is_active ? 'var(--success)' : 'var(--danger)'
                                                                    }} />
                                                                </div>

                                                                {/* Subcaste Actions Column */}
                                                                <div style={{ width: '120px', display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        onClick={() => {
                                                                            setEditingSubCaste(subCaste);
                                                                            setSubCasteForm({
                                                                                caste_id: subCaste.caste_id,
                                                                                name: subCaste.name,
                                                                                is_active: subCaste.is_active,
                                                                                order_number: subCaste.order_number || 0
                                                                            });
                                                                        }}
                                                                        style={{
                                                                            padding: '0.2rem',
                                                                            background: 'transparent',
                                                                            color: 'var(--info)',
                                                                            border: 'none',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <FaEdit size={12} />
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        onClick={() => setConfirmModal({ isOpen: true, type: 'subcaste', id: subCaste.id })}
                                                                        style={{
                                                                            padding: '0.2rem',
                                                                            background: 'transparent',
                                                                            color: 'var(--danger)',
                                                                            border: 'none',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        <FaTrash size={12} />
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'castes' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Castes</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateCaste(true)}
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
                                fontWeight: '500'
                            }}
                        >
                            <FaPlus /> Add Caste
                        </motion.button>
                    </div>

                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--input-bg)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Religion</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>Order</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-primary)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {castes.map((caste, idx) => (
                                    <tr key={caste.id} style={{ borderTop: idx > 0 ? '1px solid var(--border-color)' : 'none' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{caste.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{getReligionName(caste.religion_id)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{caste.order_number || 0}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: caste.is_active ? 'var(--success)' : 'var(--danger)',
                                                color: 'white',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {caste.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => {
                                                        setEditingCaste(caste);
                                                        setCasteForm({
                                                            religion_id: caste.religion_id,
                                                            name: caste.name,
                                                            is_active: caste.is_active,
                                                            order_number: caste.order_number || 0
                                                        });
                                                    }}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'var(--info)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaEdit />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => setConfirmModal({ isOpen: true, type: 'caste', id: caste.id })}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'var(--danger)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaTrash />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'subcastes' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Sub-Castes</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateSubCaste(true)}
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
                                fontWeight: '500'
                            }}
                        >
                            <FaPlus /> Add Sub-Caste
                        </motion.button>
                    </div>

                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--input-bg)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Caste</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>Order</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-primary)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subCastes.map((subCaste, idx) => (
                                    <tr key={subCaste.id} style={{ borderTop: idx > 0 ? '1px solid var(--border-color)' : 'none' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{subCaste.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{getCasteName(subCaste.caste_id)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{subCaste.order_number || 0}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: subCaste.is_active ? 'var(--success)' : 'var(--danger)',
                                                color: 'white',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {subCaste.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => {
                                                        setEditingSubCaste(subCaste);
                                                        setSubCasteForm({
                                                            caste_id: subCaste.caste_id,
                                                            name: subCaste.name,
                                                            is_active: subCaste.is_active,
                                                            order_number: subCaste.order_number || 0
                                                        });
                                                    }}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'var(--info)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaEdit />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => setConfirmModal({ isOpen: true, type: 'subcaste', id: subCaste.id })}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'var(--danger)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaTrash />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Create Religion Modal */}
            <AnimatePresence>
                {showCreateReligion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateReligion(false)}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: '2rem',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Add New Religion</h3>
                            <form onSubmit={handleCreateReligion}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={religionForm.name}
                                        onChange={(e) => setReligionForm({ ...religionForm, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Order Number</label>
                                    <input
                                        type="number"
                                        value={religionForm.order_number}
                                        onChange={(e) => setReligionForm({ ...religionForm, order_number: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={religionForm.is_active}
                                            onChange={(e) => setReligionForm({ ...religionForm, is_active: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>Active</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateReligion(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Religion Modal */}
            <AnimatePresence>
                {editingReligion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditingReligion(null)}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: '2rem',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Edit Religion</h3>
                            <form onSubmit={handleUpdateReligion}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={religionForm.name}
                                        onChange={(e) => setReligionForm({ ...religionForm, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Order Number</label>
                                    <input
                                        type="number"
                                        value={religionForm.order_number}
                                        onChange={(e) => setReligionForm({ ...religionForm, order_number: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={religionForm.is_active}
                                            onChange={(e) => setReligionForm({ ...religionForm, is_active: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>Active</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEditingReligion(null)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Caste Modal */}
            <AnimatePresence>
                {showCreateCaste && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateCaste(false)}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: '2rem',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Add New Caste</h3>
                            <form onSubmit={handleCreateCaste}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Religion *</label>
                                    <select
                                        value={casteForm.religion_id}
                                        onChange={(e) => setCasteForm({ ...casteForm, religion_id: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="">Select Religion</option>
                                        {religions.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={casteForm.name}
                                        onChange={(e) => setCasteForm({ ...casteForm, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Order Number</label>
                                    <input
                                        type="number"
                                        value={casteForm.order_number}
                                        onChange={(e) => setCasteForm({ ...casteForm, order_number: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={casteForm.is_active}
                                            onChange={(e) => setCasteForm({ ...casteForm, is_active: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>Active</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateCaste(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Caste Modal */}
            <AnimatePresence>
                {editingCaste && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditingCaste(null)}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: '2rem',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Edit Caste</h3>
                            <form onSubmit={handleUpdateCaste}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Religion *</label>
                                    <select
                                        value={casteForm.religion_id}
                                        onChange={(e) => setCasteForm({ ...casteForm, religion_id: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="">Select Religion</option>
                                        {religions.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={casteForm.name}
                                        onChange={(e) => setCasteForm({ ...casteForm, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Order Number</label>
                                    <input
                                        type="number"
                                        value={casteForm.order_number}
                                        onChange={(e) => setCasteForm({ ...casteForm, order_number: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={casteForm.is_active}
                                            onChange={(e) => setCasteForm({ ...casteForm, is_active: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>Active</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEditingCaste(null)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create SubCaste Modal */}
            <AnimatePresence>
                {showCreateSubCaste && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateSubCaste(false)}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: '2rem',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Add New Sub-Caste</h3>
                            <form onSubmit={handleCreateSubCaste}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Caste *</label>
                                    <select
                                        value={subCasteForm.caste_id}
                                        onChange={(e) => setSubCasteForm({ ...subCasteForm, caste_id: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="">Select Caste</option>
                                        {castes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({getReligionName(c.religion_id)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={subCasteForm.name}
                                        onChange={(e) => setSubCasteForm({ ...subCasteForm, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Order Number</label>
                                    <input
                                        type="number"
                                        value={subCasteForm.order_number}
                                        onChange={(e) => setSubCasteForm({ ...subCasteForm, order_number: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={subCasteForm.is_active}
                                            onChange={(e) => setSubCasteForm({ ...subCasteForm, is_active: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>Active</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateSubCaste(false)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit SubCaste Modal */}
            <AnimatePresence>
                {editingSubCaste && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditingSubCaste(null)}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                padding: '2rem',
                                width: 'min(500px, 95vw)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)' }}>Edit Sub-Caste</h3>
                            <form onSubmit={handleUpdateSubCaste}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Caste *</label>
                                    <select
                                        value={subCasteForm.caste_id}
                                        onChange={(e) => setSubCasteForm({ ...subCasteForm, caste_id: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="">Select Caste</option>
                                        {castes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({getReligionName(c.religion_id)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Name *</label>
                                    <input
                                        type="text"
                                        value={subCasteForm.name}
                                        onChange={(e) => setSubCasteForm({ ...subCasteForm, name: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Order Number</label>
                                    <input
                                        type="number"
                                        value={subCasteForm.order_number}
                                        onChange={(e) => setSubCasteForm({ ...subCasteForm, order_number: parseInt(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={subCasteForm.is_active}
                                            onChange={(e) => setSubCasteForm({ ...subCasteForm, is_active: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>Active</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEditingSubCaste(null)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--card-bg)',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: '', id: null })}
                onConfirm={handleDelete}
                title={`Delete ${confirmModal.type}`}
                message={`Are you sure you want to delete this ${confirmModal.type}? This action cannot be undone.`}
            />
        </div>
    );
}
