import { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../api/rolePermissionsApi';
import {
  LuShield, LuPlus, LuSave, LuCheck, LuTriangleAlert,
  LuRefreshCw, LuPencil, LuTrash2, LuX
} from 'react-icons/lu';
import { FaSearch, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', label: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');

  const activeFilterCount = 0;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data.roles);
    } catch (err) {
      showToast('Failed to load roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', label: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setForm({ name: role.name, label: role.label, description: role.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.label.trim()) {
      showToast('Name and label are required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateRole(editing.id, form);
        showToast('Role updated successfully');
      } else {
        await createRole(form);
        showToast('Role created successfully');
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save role', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete role "${role.label}"? This action cannot be undone.`)) return;
    try {
      await deleteRole(role.id);
      showToast('Role deleted successfully');
      fetchRoles();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete role', 'error');
    }
  };

  const filteredRoles = roles.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="roles-page">
      <style>{`
        .roles-page .um-toolbar { position: sticky; top: 0; z-index: 5; background: var(--card-bg); padding-bottom: 0.5rem; }
        .roles-page .um-search-row { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
        .roles-page .um-search-wrap { position: relative; flex: 1 1 260px; min-width: 0; }
        .roles-page .um-search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.85rem; }
        .roles-page .um-search-wrap input { width: 100%; padding-left: 2.25rem; margin-bottom: 0; box-sizing: border-box; }
        .roles-page .um-filter-toggle { display: none; align-items: center; gap: 0.5rem; border: 1.5px solid var(--border-color); background: var(--card-bg); color: var(--text); border-radius: 10px; padding: 0.55rem 0.9rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
        .roles-page .um-filter-badge { background: var(--primary); color: white; border-radius: 9999px; font-size: 0.68rem; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
        .roles-page .um-cards { display: none; }
        .roles-page .um-card { border: 1px solid var(--border-color); border-radius: 14px; padding: 1rem; margin-bottom: 0.85rem; background: var(--card-bg); }
        .roles-page .um-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
        .roles-page .um-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem; }
        .roles-page .um-card-grid dt { color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.15rem; }
        .roles-page .um-card-grid dd { margin: 0; font-weight: 500; word-break: break-word; }
        .roles-page .um-card-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .roles-page .um-card-actions .btn { flex: 1 1 auto; justify-content: center; padding: 0.55rem 0.75rem; }
        .roles-page .um-empty { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
        .roles-page .um-empty svg { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.5; }
        .roles-page .um-skel-row { height: 56px; border-radius: 10px; margin-bottom: 0.6rem; background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border-color) 37%, var(--hover-bg) 63%); background-size: 400% 100%; animation: um-shimmer 1.4s ease infinite; }
        @keyframes um-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        .roles-page .um-filter-drawer { display: none; }
        @media (max-width: 768px) {
          .roles-page .table-container { display: none; }
          .roles-page .um-cards { display: block; }
          .roles-page .um-filter-toggle { display: inline-flex; }
          .roles-page .filter-bar { display: none; }
          .roles-page .um-filter-drawer.open { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; background: var(--hover-bg); }
          .roles-page .um-filter-drawer select { width: 100%; appearance: none; -webkit-appearance: none; background-color: var(--card-bg); color: var(--text); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 0.7rem 2.25rem 0.7rem 0.9rem; font-size: 0.85rem; font-weight: 500; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.85rem center; background-size: 1.1rem; }
          .roles-page .um-filter-drawer select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.18); }
        }
        @media (min-width: 769px) { .roles-page .um-filter-drawer { display: none !important; } }
      `}</style>

      <div className="card">
        <div className="um-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                <LuShield size={22} style={{ color: 'var(--primary)' }} />
                Roles
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Manage roles for sidebar menu permissions
              </p>
            </div>
            <button onClick={openCreate} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 20px', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff', fontWeight: 600, fontSize: 13,
              boxShadow: '0 4px 12px rgba(0,200,151,0.35)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <LuPlus size={15} />
              Add Role
            </button>
          </div>

          <div className="um-search-row">
            <div className="um-search-wrap">
              <FaSearch />
              <input
                type="text"
                placeholder="Search roles..."
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

          <div className={`um-filter-drawer ${filtersOpen ? 'open' : ''}`} />
        </div>

        {loading ? (
          <div style={{ padding: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="um-skel-row" />)}
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="um-empty">
            <LuShield size={32} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No roles found</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{search ? 'Try adjusting your search.' : 'Create a new role to get started.'}</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Label</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map(role => (
                    <tr key={role.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{role.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text)' }}>{role.label}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{role.description || '-'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => openEdit(role)} style={{
                          padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-color)',
                          background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)',
                          marginRight: 6, fontSize: 12,
                        }}><LuPencil size={13} /></button>
                        {role.name !== 'admin' && (
                          <button onClick={() => handleDelete(role)} style={{
                            padding: '5px 10px', borderRadius: 8, border: '1px solid #EF444444',
                            background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: 12,
                          }}><LuTrash2 size={13} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="um-cards">
              {filteredRoles.map(role => (
                <div className="um-card" key={role.id}>
                  <div className="um-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <LuShield size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{role.name}</span>
                    </div>
                  </div>
                  <dl className="um-card-grid">
                    <div>
                      <dt>Label</dt>
                      <dd>{role.label}</dd>
                    </div>
                    <div>
                      <dt>Description</dt>
                      <dd>{role.description || '-'}</dd>
                    </div>
                  </dl>
                  <div className="um-card-actions">
                    <button onClick={() => openEdit(role)} className="btn btn-secondary">
                      <LuPencil size={13} /> Edit
                    </button>
                    {role.name !== 'admin' && (
                      <button onClick={() => handleDelete(role)} className="btn btn-danger">
                        <LuTrash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--card-bg)', borderRadius: 16,
            padding: 28, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editing ? 'Edit Role' : 'Add Role'}</h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4,
              }}><LuX size={18} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. support_agent"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                  fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Label *</label>
              <input
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Support Agent"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                  fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                  fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)',
                background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: saving ? 'var(--border-color)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff', fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? <LuRefreshCw size={14} className="spinner" /> : <LuSave size={14} />}
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div key={toast.id} style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000000,
          padding: '12px 18px', borderRadius: 12,
          background: toast.type === 'error'
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : 'linear-gradient(135deg, #00C897, #059669)',
          color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontWeight: 600, fontSize: 13,
          animation: 'toastSlideIn 0.35s ease-out',
          border: '1px solid rgba(255,255,255,0.1)',
          minWidth: 200,
        }}>
          {toast.type === 'error' ? <LuTriangleAlert size={18} /> : <LuCheck size={18} />}
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
