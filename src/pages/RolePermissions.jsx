import { useState, useEffect } from 'react';
import { getRolePermissions, updateRolePermissions, getRoles, getMenus, createRole, deleteRole, createMenu, deleteMenu } from '../api/rolePermissionsApi';
import {
  LuShield, LuSave, LuCheck, LuTriangleAlert, LuRefreshCw,
  LuUsers, LuShieldAlert, LuWallet, LuHeart,
  LuDatabase, LuSettings2, LuPlus, LuTrash2, LuFolder
} from 'react-icons/lu';

const ROLE_ACCENTS = {
  admin: '#00C897',
  customer_care: '#3B82F6',
  verification: '#F59E0B',
  accountant: '#8B5CF6',
  mediator: '#EF4444',
};

const GROUP_ICONS = {
  Management: LuUsers,
  'Safety & Security': LuShieldAlert,
  Financial: LuWallet,
  'App Content': LuHeart,
  'Data Management': LuDatabase,
  'Settings & Logs': LuSettings2,
};

function RoleCard({ role, roleName, label, accent, menusByGroup, checkedMenuIds, onToggle }) {
  const allMenuIds = Object.values(menusByGroup).flat().map(m => m.id);
  const checkedCount = allMenuIds.filter(id => checkedMenuIds.has(id)).length;
  const allChecked = checkedCount === allMenuIds.length && allMenuIds.length > 0;

  const toggleAll = () => {
    for (const id of allMenuIds) {
      onToggle(roleName, id, !allChecked);
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 16,
      border: '1px solid var(--border-color)',
      boxShadow: '0 1px 3px var(--shadow-color), 0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: `linear-gradient(135deg, ${accent}0d, ${accent}04)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            color: '#fff', fontSize: 14,
          }}>
            <LuShield />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{role.label || label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {checkedCount}/{allMenuIds.length} menus enabled
            </div>
          </div>
        </div>
        <button
          onClick={toggleAll}
          style={{
            padding: '4px 12px', borderRadius: 8,
            border: `1px solid ${accent}44`,
            background: allChecked ? `${accent}15` : 'transparent',
            color: accent, fontWeight: 600, fontSize: 11,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${accent}20`; }}
          onMouseLeave={e => { e.currentTarget.style.background = allChecked ? `${accent}15` : 'transparent'; }}
        >
          {allChecked ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div style={{ padding: '12px 20px 16px' }}>
        {Object.entries(menusByGroup).map(([group, items]) => {
          const GroupIcon = GROUP_ICONS[group] || LuFolder;
          const isRolePermissions = group === 'Settings & Logs';
          const visibleItems = isRolePermissions
            ? items.filter(m => m.path !== '/role-permissions' || roleName === 'admin')
            : items;
          if (visibleItems.length === 0) return null;
          return (
            <div key={group} style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--text-secondary)',
                marginBottom: 6, padding: '4px 0',
              }}>
                <GroupIcon size={12} />
                {group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {visibleItems.map(menu => {
                  const isChecked = checkedMenuIds.has(menu.id);
                  return (
                    <label key={menu.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '5px 8px', borderRadius: 8,
                      cursor: 'pointer',
                      background: isChecked ? `${accent}06` : 'transparent',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = isChecked ? `${accent}10` : 'var(--hover-bg)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isChecked ? `${accent}06` : 'transparent'; }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(roleName, menu.id, !isChecked)}
                        style={{ accentColor: accent, width: 15, height: 15, flexShrink: 0, margin: 0 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: isChecked ? 600 : 400, color: 'var(--text)' }}>
                        {menu.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [menusByGroup, setMenusByGroup] = useState({});
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getRolePermissions();
      const data = res.data;
      setRoles(data.roles);
      setMenusByGroup(data.menus);
      const permMap = {};
      for (const role of data.roles) {
        permMap[role.name] = new Set((role.menus || []).map(m => m.id));
      }
      setPermissions(permMap);
    } catch (err) {
      console.error('Failed to load permissions:', err);
      showToast('Failed to load permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (roleName, menuId, checked) => {
    setPermissions(prev => {
      const next = { ...prev };
      const set = new Set(prev[roleName] || []);
      if (checked) set.add(menuId);
      else set.delete(menuId);
      next[roleName] = set;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = roles.map(role => ({
        role_id: role.id,
        menu_ids: Array.from(permissions[role.name] || []),
      }));
      await updateRolePermissions({ permissions: payload });
      showToast('Permissions saved successfully');
    } catch (err) {
      console.error('Failed to save permissions:', err);
      showToast('Failed to save permissions', 'error');
    } finally {
      setSaving(false);
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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <LuShield size={22} style={{ color: 'var(--primary)' }} />
            Role Menu Permissions
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            Control which menu items each role can see in the sidebar
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 22px', borderRadius: 10,
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            background: saving
              ? 'var(--border-color)'
              : 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#fff', fontWeight: 600, fontSize: 13,
            boxShadow: saving ? 'none' : '0 4px 12px rgba(0,200,151,0.35)',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          {saving ? <LuRefreshCw size={15} className="spinner" /> : <LuSave size={15} />}
          {saving ? 'Saving…' : 'Save Permissions'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 20,
      }}>
        {roles.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            roleName={role.name}
            label={role.label}
            accent={ROLE_ACCENTS[role.name] || 'var(--primary)'}
            menusByGroup={menusByGroup}
            checkedMenuIds={permissions[role.name] || new Set()}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {toast && (
        <div key={toast.id} style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000000,
          padding: '12px 18px', borderRadius: 12,
          background: toast.type === 'error'
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : 'linear-gradient(135deg, #00C897, #059669)',
          color: '#fff',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
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
