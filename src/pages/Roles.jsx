import { useState, useEffect } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../api/rolePermissionsApi';
import {
  LuShield, LuPlus, LuSave, LuCheck, LuTriangleAlert,
  LuRefreshCw, LuPencil, LuTrash2, LuX
} from 'react-icons/lu';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', label: '', description: '' });
  const [saving, setSaving] = useState(false);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <LuShield size={22} style={{ color: 'var(--primary)' }} />
            Roles
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
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

      <div style={{
        background: 'var(--card-bg)',
        borderRadius: 16,
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 3px var(--shadow-color)',
        overflow: 'hidden',
      }}>
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
            {roles.map(role => (
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
