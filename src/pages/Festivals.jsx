import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import { FaGift, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaToggleOn, FaToggleOff, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { LuPercent, LuIndianRupee } from 'react-icons/lu';

const CALENDAR_TYPES = [
    { value: 'gregorian_fixed', label: 'English Calendar' },
    { value: 'hijri', label: 'Hijri (Islamic)' },
    { value: 'malayalam', label: 'Malayalam (Kerala)' },
];

const HIJRI_EVENTS = [
    { value: 'eid_ul_fitr', label: 'Eid-ul-Fitr' },
    { value: 'eid_ul_adha', label: 'Eid-ul-Adha' },
    { value: 'ramadan_start', label: 'Ramadan Start' },
];

const ML_EVENTS = [
    { value: 'onam', label: 'Onam' },
    { value: 'vishu', label: 'Vishu' },
    { value: 'thiruvathira', label: 'Thiruvathira' },
    { value: 'deepavali', label: 'Deepavali' },
    { value: 'shivarathri', label: 'Maha Shivaratri' },
    { value: 'navaratri', label: 'Navaratri' },
];

const GENDER_OPTIONS = [
    { value: '', label: 'Both (Male & Female)' },
    { value: 'male', label: 'Male Only' },
    { value: 'female', label: 'Female Only' },
];

const defaultForm = {
    celebration_name: '',
    offer_discount: '',
    offer_discount_type: 'percentage',
    calendar_type: 'gregorian_fixed',
    hijri_event: '',
    ml_event: '',
    fixed_month: '',
    fixed_day: '',
    start_offset_days: 0,
    end_offset_days: 0,
    reminder_days_before: 30,
    is_active: true,
    target_gender: '',
};

export default function Festivals() {
    const [festivals, setFestivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ ...defaultForm });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [toast, setToast] = useState(null);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [lookupResults, setLookupResults] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [celebrationDots, setCelebrationDots] = useState({});

    // Fetch celebration dots (Hijri + Malayalam events) when month/year changes
    useEffect(() => {
        api.get('/admin/festivals/lookup-month', { params: { year: calendarYear, month: calendarMonth + 1 } })
            .then(res => setCelebrationDots(res.data.celebrations || {}))
            .catch(() => { });
    }, [calendarMonth, calendarYear]);

    useEffect(() => {
        if (!selectedDate) { setLookupResults(null); return; }
        const cachedEvents = festivals.reduce((acc, f) => {
            (f.occurrences || []).forEach(occ => {
                if (!occ.start_at) return;
                const s = occ.start_at.slice(0, 10);
                const e = occ.end_at ? occ.end_at.slice(0, 10) : s;
                if (selectedDate >= s && selectedDate <= e) acc.push(f.celebration_name);
            });
            return acc;
        }, []);
        // If already have events (DB or celebration dots), no need to lookup
        const hasDots = celebrationDots[selectedDate] && celebrationDots[selectedDate].events?.length > 0;
        if (cachedEvents.length > 0 || hasDots) { setLookupResults(null); return; }

        setLookupLoading(true);
        setLookupResults(null);
        api.get('/admin/festivals/lookup-date', { params: { date: selectedDate } })
            .then(res => setLookupResults(res.data.events || []))
            .catch(() => setLookupResults([]))
            .finally(() => setLookupLoading(false));
    }, [selectedDate, festivals, celebrationDots]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchFestivals = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/festivals');
            setFestivals(response.data.festivals || []);
        } catch (error) {
            console.error('Failed to fetch festivals', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFestivals(); }, []);

    const openCreate = () => {
        setEditing(null);
        setFormData({ ...defaultForm });
        setShowForm(true);
    };

    const openEdit = (festival) => {
        setEditing(festival);
        setFormData({
            celebration_name: festival.celebration_name || '',
            offer_discount: festival.offer_discount ?? '',
            offer_discount_type: festival.offer_discount_type || 'percentage',
            calendar_type: festival.calendar_type || 'gregorian_fixed',
            hijri_event: festival.hijri_event || '',
            ml_event: festival.ml_event || '',
            fixed_month: festival.fixed_month ?? '',
            fixed_day: festival.fixed_day ?? '',
            start_offset_days: festival.start_offset_days ?? 0,
            end_offset_days: festival.end_offset_days ?? 0,
            reminder_days_before: festival.reminder_days_before ?? 30,
            is_active: Boolean(festival.is_active),
            target_gender: festival.target_gender || '',
        });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                offer_discount: formData.offer_discount !== '' ? parseFloat(formData.offer_discount) : null,
                fixed_month: formData.fixed_month !== '' ? parseInt(formData.fixed_month) : null,
                fixed_day: formData.fixed_day !== '' ? parseInt(formData.fixed_day) : null,
                start_offset_days: parseInt(formData.start_offset_days) || 0,
                end_offset_days: parseInt(formData.end_offset_days) || 0,
                reminder_days_before: parseInt(formData.reminder_days_before) || 30,
            };

            if (editing) {
                await api.put(`/admin/festivals/${editing.id}`, payload);
                showToast('Festival updated successfully');
            } else {
                await api.post('/admin/festivals', payload);
                showToast('Festival created successfully');
            }
            setShowForm(false);
            fetchFestivals();
        } catch (error) {
            showToast(error.response?.data?.messages?.celebration_name?.[0] || error.response?.data?.error || 'Failed to save festival', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/festivals/${confirmModal.id}`);
            showToast('Festival deleted successfully');
            setConfirmModal({ isOpen: false, id: null });
            fetchFestivals();
        } catch (error) {
            showToast('Failed to delete festival', 'error');
        }
    };

    const handleResolve = async (festival) => {
        try {
            const response = await api.post(`/admin/festivals/${festival.id}/resolve`);
            showToast(`Dates resolved: ${response.data.occurrence?.start_at?.slice(0, 10)} – ${response.data.occurrence?.end_at?.slice(0, 10)}`);
            fetchFestivals();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to resolve dates', 'error');
        }
    };

    const handleToggleActive = async (festival) => {
        try {
            await api.put(`/admin/festivals/${festival.id}`, { is_active: !festival.is_active });
            fetchFestivals();
        } catch (error) {
            showToast('Failed to toggle status', 'error');
        }
    };

    const getCalendarLabel = (type) => {
        const found = CALENDAR_TYPES.find(t => t.value === type);
        return found ? found.label : type;
    };

    const getEventLabel = (festival) => {
        if (festival.calendar_type === 'hijri') {
            const found = HIJRI_EVENTS.find(e => e.value === festival.hijri_event);
            return found ? found.label : festival.hijri_event;
        }
        if (festival.calendar_type === 'malayalam') {
            const found = ML_EVENTS.find(e => e.value === festival.ml_event);
            return found ? found.label : festival.ml_event;
        }
        const year = new Date().getFullYear();
        const month = festival.fixed_month;
        const day = festival.fixed_day;
        if (month && day) {
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        return `${day}/${month}`;
    };

    // Build a map of date strings → festival events from occurrences
    const getEventsMap = () => {
        const map = {};
        festivals.forEach(f => {
            (f.occurrences || []).forEach(occ => {
                if (!occ.start_at) return;
                const startStr = occ.start_at.slice(0, 10);
                const endStr = occ.end_at ? occ.end_at.slice(0, 10) : startStr;
                const start = new Date(startStr + 'T00:00:00');
                const end = new Date(endStr + 'T00:00:00');
                const current = new Date(start);
                while (current <= end) {
                    const key = current.toISOString().slice(0, 10);
                    if (!map[key]) map[key] = [];
                    map[key].push({ festival: f, occurrence: occ, source: 'db' });
                    current.setDate(current.getDate() + 1);
                }
            });
        });
        // Merge celebration dots from API lookup
        Object.entries(celebrationDots).forEach(([dateKey, info]) => {
            if (!map[dateKey]) map[dateKey] = [];
            (info.events || []).forEach(evName => {
                const alreadyExists = map[dateKey].some(e =>
                    (e.festival && e.festival.celebration_name === evName) ||
                    (e.name === evName)
                );
                if (!alreadyExists) {
                    map[dateKey].push({
                        source: 'api',
                        name: evName,
                        calendar: info.calendar || 'hijri',
                        hijri: info.hijri || null,
                        festival: { celebration_name: evName, is_active: true, offer_discount: null },
                    });
                }
            });
        });
        return map;
    };

    const eventsMap = getEventsMap();

    const calendarNav = (dir) => {
        let m = calendarMonth + dir;
        let y = calendarYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setCalendarMonth(m);
        setCalendarYear(y);
        setSelectedDate(null);
    };

    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
    const monthName = new Date(calendarYear, calendarMonth).toLocaleString('en', { month: 'long', year: 'numeric' });

    const calendarDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const todayStr = new Date().toISOString().slice(0, 10);

    const selectedDateEvents = selectedDate ? eventsMap[selectedDate] || [] : [];

    // Build list of all celebration events in the current month
    const monthEvents = [];
    const monthPrefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
    Object.entries(eventsMap).forEach(([dateKey, evs]) => {
        if (dateKey.startsWith(monthPrefix)) {
            evs.forEach(ev => {
                const day = parseInt(dateKey.slice(8), 10);
                monthEvents.push({ dateKey, day, ...ev });
            });
        }
    });
    monthEvents.sort((a, b) => a.day - b.day);
    // Deduplicate by day+name
    const seen = new Set();
    const uniqueMonthEvents = monthEvents.filter(ev => {
        const key = `${ev.day}-${ev.festival?.celebration_name || ev.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const dotColors = { english: '#3B82F6', hijri: '#10B981', malayalam: '#9CA3AF' };

    return (
        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="festivals-page card">
            <style>{`
.festivals-page .festivals-sidebar { flex: 1 1 280px; max-width: 280px; width: 100%; }
@media (max-width: 768px) { .festivals-page .festivals-sidebar { max-width: 100%; flex-basis: 100%; } }
`}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem' }}>
                        <FaGift style={{ color: '#10B981' }} /> Festival Offers
                    </h1>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Manage discount offers for festivals and celebrations
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openCreate} style={{ borderRadius: '12px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPlus /> New Festival
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Table */}
                <div style={{ flex: '1 1 600px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '1rem' }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="um-skel-row" />)}</div>
                    ) : festivals.length === 0 ? (
                        <div className="um-empty"><FaGift /><p>No festivals configured yet. Click "New Festival" to add one.</p></div>
                    ) : (
                        <div className="um-table-wrap" style={{ overflowX: 'auto', position: 'relative' }}>
                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg, rgba(255,255,255,0.02))' }}>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Name & Event</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Discount</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Calendar</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Active Window</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>Targeted Gender</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
                                        <th style={{
                                            padding: '0.75rem 1rem',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            position: 'sticky',
                                            right: 0,
                                            zIndex: 2,
                                            minWidth: '176px',
                                            background: 'var(--hover-bg, var(--card-bg))',
                                            boxShadow: '-10px 0 18px rgba(0,0,0,0.14)',
                                        }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {festivals.map((f, idx) => (
                                        <tr key={f.id}
                                            style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'var(--hover-bg, rgba(255,255,255,0.03))'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div style={{ fontWeight: 500 }}>{f.celebration_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{getEventLabel(f)}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', background: '#10B98120', color: '#10B981', fontWeight: 600 }}>
                                                    {f.offer_discount_type === 'percentage' ? <LuPercent size={12} /> : <LuIndianRupee size={12} />}
                                                    {f.offer_discount_type === 'percentage' ? `${f.offer_discount}%` : `₹${f.offer_discount}`} OFF
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{getCalendarLabel(f.calendar_type)}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                                {f.occurrences?.length > 0 ? (
                                                    <span>
                                                        {f.occurrences[0].start_at?.slice(0, 10)} → {f.occurrences[0].end_at?.slice(0, 10)}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not resolved</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', background: !f.target_gender ? '#6B728020' : f.target_gender === 'male' ? '#3B82F620' : '#EC489920', color: !f.target_gender ? '#6B7280' : f.target_gender === 'male' ? '#3B82F6' : '#EC4899', fontWeight: 500 }}>
                                                    {!f.target_gender ? 'Both' : f.target_gender === 'male' ? 'Male' : 'Female'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', background: f.is_active ? '#10B98120' : '#EF444420', color: f.is_active ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                                                    {f.is_active ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                                                    {f.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '0.75rem 1rem',
                                                textAlign: 'center',
                                                position: 'sticky',
                                                right: 0,
                                                zIndex: 1,
                                                minWidth: '176px',
                                                background: 'var(--card-bg)',
                                                boxShadow: '-10px 0 18px rgba(0,0,0,0.12)',
                                            }}>
                                                <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                                                    <button className="btn btn-sm" onClick={() => openEdit(f)} title="Edit"
                                                        style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', background: 'var(--hover-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-color)', color: 'var(--text)' }}>
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button className="btn btn-sm" onClick={() => handleResolve(f)} title="Resolve Dates"
                                                        style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', background: 'var(--hover-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-color)', color: 'var(--text)' }}>
                                                        <FaCalendarAlt size={14} />
                                                    </button>
                                                    <button className="btn btn-sm" onClick={() => handleToggleActive(f)} title="Toggle Active"
                                                        style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', background: 'var(--hover-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-color)', color: f.is_active ? '#F59E0B' : '#10B981' }}>
                                                        {f.is_active ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
                                                    </button>
                                                    <button className="btn btn-sm" onClick={() => setConfirmModal({ isOpen: true, id: f.id })} title="Delete"
                                                        style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', background: 'var(--hover-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-color)', color: '#EF4444' }}>
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="um-cards" style={{ width: '100%' }}>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <div key={i} className="um-skel-row" />)
                    ) : festivals.length === 0 ? (
                        <div className="um-empty"><FaGift /><p>No festivals configured yet</p></div>
                    ) : (
                        festivals.map(f => (
                            <div key={f.id} className="um-card">
                                <div className="um-card-top">
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.celebration_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getEventLabel(f)}</div>
                                    </div>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
                                        background: f.is_active ? '#10B98120' : '#EF444420',
                                        color: f.is_active ? '#10B981' : '#EF4444', fontWeight: 500,
                                    }}>
                                        {f.is_active ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                                        {f.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="um-card-grid">
                                    <div><dt>Discount</dt><dd><span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', background: '#10B98120', color: '#10B981', fontWeight: 600 }}>{f.offer_discount_type === 'percentage' ? `${f.offer_discount}%` : `₹${f.offer_discount}`} OFF</span></dd></div>
                                    <div><dt>Calendar</dt><dd>{getCalendarLabel(f.calendar_type)}</dd></div>
                                    <div><dt>Window</dt><dd>{f.occurrences?.length > 0 ? `${f.occurrences[0].start_at?.slice(0, 10)} → ${f.occurrences[0].end_at?.slice(0, 10)}` : <span style={{ fontStyle: 'italic' }}>Not resolved</span>}</dd></div>
                                    <div><dt>Target</dt><dd>{!f.target_gender ? 'Both' : f.target_gender === 'male' ? 'Male' : 'Female'}</dd></div>
                                </div>
                                <div className="um-card-actions">
                                    <button className="btn btn-sm" onClick={() => openEdit(f)} style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)' }}><FaEdit size={12} /> Edit</button>
                                    <button className="btn btn-sm" onClick={() => handleResolve(f)} style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text)' }}><FaCalendarAlt size={12} /> Resolve</button>
                                    <button className="btn btn-sm" onClick={() => handleToggleActive(f)} style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: f.is_active ? '#F59E0B' : '#10B981' }}>{f.is_active ? <FaToggleOff size={12} /> : <FaToggleOn size={12} />} Toggle</button>
                                    <button className="btn btn-sm" onClick={() => setConfirmModal({ isOpen: true, id: f.id })} style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', border: '1px solid #EF444444', background: 'transparent', color: '#EF4444' }}><FaTrash size={12} /> Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right Sidebar Column */}
                <div className="festivals-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Calendar */}
                    <div style={{
                        background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)',
                        width: '100%', padding: '1.25rem', boxSizing: 'border-box'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <button onClick={() => calendarNav(-1)} className="btn btn-sm"
                                style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent' }}>
                                ◀
                            </button>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{monthName}</span>
                            <button onClick={() => calendarNav(1)} className="btn btn-sm"
                                style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent' }}>
                                ▶
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} style={{ padding: '0.25rem 0', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{d}</div>
                            ))}
                            {calendarDays.map((d, i) => {
                                if (d === null) return <div key={`e${i}`} />;
                                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const events = eventsMap[dateStr] || [];
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;
                                return (
                                    <div key={dateStr}
                                        onClick={() => { setSelectedDate(isSelected ? null : dateStr); }}
                                        style={{
                                            padding: '0.3rem 0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: isToday ? 700 : 400,
                                            background: isSelected ? '#10B981' : isToday ? 'rgba(16,185,129,0.15)' : 'transparent',
                                            color: isSelected ? 'white' : isToday ? '#10B981' : 'var(--text-primary)',
                                            transition: 'all 0.15s', position: 'relative',
                                        }}
                                    >
                                        {d}
                                        {events.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                                                {events.slice(0, 3).map((e, ei) => (
                                                    <div key={ei} style={{
                                                        width: '5px', height: '5px', borderRadius: '50%',
                                                        background: e.source === 'api'
                                                            ? dotColors[e.calendar] || '#10B981'
                                                            : e.festival?.is_active ? '#10B981' : '#F59E0B',
                                                    }} />
                                                ))}
                                                {events.length > 3 && (
                                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>+{events.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {selectedDate && (
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                {selectedDateEvents.length > 0 ? (
                                    selectedDateEvents.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0', fontSize: '0.8rem' }}>
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                                background: e.source === 'api' ? dotColors[e.calendar] || '#10B981' : e.festival?.is_active ? '#10B981' : '#F59E0B',
                                            }} />
                                            <span>{e.festival?.celebration_name || e.name}</span>
                                            {e.hijri && (
                                                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                                    {e.hijri}
                                                </span>
                                            )}
                                            {e.source !== 'api' && e.festival?.offer_discount && (
                                                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#10B98120', color: '#10B981', fontWeight: 600 }}>
                                                    {e.festival.offer_discount_type === 'percentage' ? `${e.festival.offer_discount}%` : `₹${e.festival.offer_discount}`}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : lookupLoading ? (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaSpinner className="spinner" /> Looking up...
                                    </div>
                                ) : lookupResults && lookupResults.filter(ev => !ev.is_date).length > 0 ? (
                                    lookupResults.filter(ev => !ev.is_date).map((ev, i) => (
                                        <div key={'lk' + i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0', fontSize: '0.8rem' }}>
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                                                background: dotColors[ev.calendar] || '#10B981',
                                            }} />
                                            <span>{ev.name}</span>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                                {ev.description}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No festivals on this day</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Month Events Sidebar */}
                    <div style={{
                        background: 'var(--card-bg)', borderRadius: '16px',
                        border: '1px solid var(--border-color)', padding: '1rem', position: 'sticky', top: '1rem', maxHeight: 'calc(100vh - 6rem)', overflow: 'auto', width: '100%', boxSizing: 'border-box'
                    }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FaCalendarAlt size={12} style={{ color: '#10B981' }} /> {monthName}
                        </div>
                        {uniqueMonthEvents.length === 0 ? (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
                                No celebrations this month
                            </div>
                        ) : (
                            uniqueMonthEvents.map((ev, i) => {
                                const prevDay = i > 0 ? uniqueMonthEvents[i - 1].day : -1;
                                const showDate = ev.day !== prevDay;
                                return (
                                    <div key={`me-${i}`} style={{ padding: '0.2rem 0' }}>
                                        {showDate && (
                                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.1rem', marginTop: i > 0 ? '0.4rem' : 0 }}>
                                                {new Date(ev.dateKey + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.1rem 0', fontSize: '0.75rem' }}>
                                            <span style={{
                                                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                                                background: ev.source === 'api' ? dotColors[ev.calendar] || '#10B981' : ev.festival?.is_active ? '#10B981' : '#F59E0B',
                                            }} />
                                            <span style={{ flex: 1 }}>{ev.festival?.celebration_name || ev.name}</span>
                                            {ev.source === 'api' && ev.calendar && (
                                                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{ev.calendar}</span>
                                            )}
                                            {ev.source !== 'api' && ev.festival?.offer_discount && (
                                                <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem', borderRadius: '3px', background: '#10B98120', color: '#10B981', fontWeight: 600 }}>
                                                    {ev.festival.offer_discount_type === 'percentage' ? `${ev.festival.offer_discount}%` : `₹${ev.festival.offer_discount}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {/* Legend */}
                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.2rem' }}>Legend</div>
                            {[
                                { color: dotColors.english, label: 'English Calendar' },
                                { color: dotColors.hijri, label: 'Islamic (Hijri)' },
                                { color: dotColors.malayalam, label: 'Malayalam' },
                                { color: '#F59E0B', label: 'Inactive Offer' },
                            ].map((l, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showForm && createPortal(
                <motion.div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={() => setShowForm(false)}
                >
                    <motion.div
                        style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-color)' }}
                        onClick={e => e.stopPropagation()}
                    >
                    <h2 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaGift style={{ color: '#10B981' }} /> {editing ? 'Edit Festival' : 'New Festival'}
                    </h2>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Celebration Name *</label>
                                    <input className="form-control" required value={formData.celebration_name}
                                        onChange={e => setFormData({ ...formData, celebration_name: e.target.value })}
                                        placeholder="e.g. Christmas Offer, Eid Offer, Onam Offer" style={{ width: '100%' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Discount</label>
                                        <input type="number" step="0.01" min="0" className="form-control" value={formData.offer_discount}
                                            onChange={e => setFormData({ ...formData, offer_discount: e.target.value })}
                                            placeholder={formData.offer_discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 10'} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Discount Type</label>
                                        <select className="form-control" value={formData.offer_discount_type}
                                            onChange={e => setFormData({ ...formData, offer_discount_type: e.target.value })} style={{ width: '100%' }}>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="cash">Cash (₹)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Calendar Type *</label>
                                    <select className="form-control" required value={formData.calendar_type}
                                        onChange={e => setFormData({ ...formData, calendar_type: e.target.value, hijri_event: '', ml_event: '', fixed_month: '', fixed_day: '' })}
                                        style={{ width: '100%' }}>
                                        {CALENDAR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>

                                {formData.calendar_type === 'gregorian_fixed' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Month *</label>
                                            <select className="form-control" value={formData.fixed_month}
                                                onChange={e => setFormData({ ...formData, fixed_month: e.target.value })} style={{ width: '100%' }}>
                                                <option value="">Select month</option>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Day *</label>
                                            <input type="number" min="1" max="31" className="form-control" value={formData.fixed_day}
                                                onChange={e => setFormData({ ...formData, fixed_day: e.target.value })} style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                )}

                                {formData.calendar_type === 'hijri' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Hijri Event *</label>
                                        <select className="form-control" value={formData.hijri_event}
                                            onChange={e => setFormData({ ...formData, hijri_event: e.target.value })} style={{ width: '100%' }}>
                                            <option value="">Select event</option>
                                            {HIJRI_EVENTS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                        </select>
                                    </div>
                                )}

                                {formData.calendar_type === 'malayalam' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Malayalam Event *</label>
                                        <select className="form-control" value={formData.ml_event}
                                            onChange={e => setFormData({ ...formData, ml_event: e.target.value })} style={{ width: '100%' }}>
                                            <option value="">Select event</option>
                                            {ML_EVENTS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Start Offset (days before event)</label>
                                        <input type="number" min="0" className="form-control" value={formData.start_offset_days}
                                            onChange={e => setFormData({ ...formData, start_offset_days: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>End Offset (days after event)</label>
                                        <input type="number" min="0" className="form-control" value={formData.end_offset_days}
                                            onChange={e => setFormData({ ...formData, end_offset_days: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Reminder (days before start)</label>
                                    <input type="number" min="0" className="form-control" value={formData.reminder_days_before}
                                        onChange={e => setFormData({ ...formData, reminder_days_before: e.target.value })} style={{ width: '100%' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Target Gender</label>
                                    <select className="form-control" value={formData.target_gender}
                                        onChange={e => setFormData({ ...formData, target_gender: e.target.value })} style={{ width: '100%' }}>
                                        {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <label className="form-toggle">
                                        <span className="switch">
                                            <input type="checkbox" checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                            <span className="slider"></span>
                                        </span>
                                    </label>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{formData.is_active ? 'Active' : 'Inactive'}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button type="button" className="btn" onClick={() => setShowForm(false)}
                                        style={{ borderRadius: '10px', padding: '0.6rem 1.25rem' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}
                                        style={{ borderRadius: '10px', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {saving ? <><FaSpinner className="spinner" /> Saving...</> : <><FaGift /> {editing ? 'Update' : 'Create'}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Festival"
                message="Are you sure you want to delete this festival offer? This action cannot be undone."
            />

            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000000,
                    padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem',
                    background: toast.type === 'error' ? '#EF4444' : '#10B981', color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    animation: 'modalSlideUp 0.3s ease-out',
                }}>
                    {toast.type === 'error' ? <FaTimesCircle size={18} /> : <FaCheckCircle size={18} />}
                    {toast.msg}
                </div>
            )}
        </motion.div>
    );
}
