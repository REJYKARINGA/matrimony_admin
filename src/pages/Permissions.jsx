import { useState, useEffect } from 'react';
import {
  getRoles, createRole, updateRole, deleteRole, reorderRoles,
  getMenus, createMenu, updateMenu, deleteMenu, reorderMenus,
  getRolePermissions, updateRolePermissions,
} from '../api/rolePermissionsApi';
import ConfirmModal from '../components/ConfirmModal';
import {
  LuShield, LuSave, LuCheck, LuTriangleAlert, LuRefreshCw,
  LuUsers, LuShieldAlert, LuWallet, LuHeart,
  LuDatabase, LuSettings2, LuFolder, LuPlus, LuPencil, LuTrash2, LuX,
  LuChevronDown, LuChevronRight,
} from 'react-icons/lu';

const loadTabOrder = () => {
  try {
    const stored = localStorage.getItem('perms_tab_order');
    return stored ? JSON.parse(stored) : ['roles', 'menus', 'permissions'];
  } catch { return ['roles', 'menus', 'permissions']; }
};

const DEFAULT_TABS = [
  { key: 'roles', label: 'Roles', icon: LuShield },
  { key: 'menus', label: 'Menu Items', icon: LuFolder },
  { key: 'permissions', label: 'Menu Permissions', icon: LuSettings2 },
];

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

function ToggleSwitch({ checked, onChange, accent, size = 18 }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(!checked); }} style={{
      width: size * 1.8, height: size, borderRadius: size, flexShrink: 0, cursor: 'pointer',
      background: checked ? accent : 'var(--border-color)', position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: checked ? size * 0.8 - 2 : 2,
        width: size - 4, height: size - 4, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function RoleCard({ role, roleName, label, accent, menusByGroup, checkedMenuIds, onToggle, collapsed, onToggleCollapse }) {
  const allMenuIds = Object.values(menusByGroup).flat().map(m => m.id);
  const checkedCount = allMenuIds.filter(id => checkedMenuIds.has(id)).length;
  const allChecked = checkedCount === allMenuIds.length && allMenuIds.length > 0;

  const toggleAll = () => {
    for (const id of allMenuIds) onToggle(roleName, id, !allChecked);
  };

  const visibleMenus = Object.entries(menusByGroup).flatMap(([group, items]) => {
    const vis = group === 'Settings & Logs' ? items.filter(m => m.path !== '/permissions' || roleName === 'admin') : items;
    return vis.map(m => ({ ...m, group }));
  });
  const checkedMenus = visibleMenus.filter(m => checkedMenuIds.has(m.id));
  const previewItems = checkedMenus.slice(0, 2);

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: '0 1px 3px var(--shadow-color), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div onClick={onToggleCollapse} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: collapsed ? 'none' : '1px solid var(--border-color)', background: `linear-gradient(135deg, ${accent}0d, ${accent}04)`, cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#fff', fontSize: 14 }}><LuShield /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{role.label || label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{checkedCount}/{allMenuIds.length} menus enabled</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div onClick={e => { e.stopPropagation(); toggleAll(); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 6, cursor: 'pointer' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>All</span>
            <ToggleSwitch checked={allChecked} onChange={toggleAll} accent={accent} />
          </div>
          {collapsed ? <LuChevronRight size={18} style={{ color: 'var(--text-secondary)' }} /> : <LuChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </div>
      {collapsed ? (
        <div style={{ padding: '0 20px 14px' }}>
          {previewItems.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {previewItems.map(m => (
                <span key={m.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: `${accent}12`, color: accent }}>
                  {m.label}
                </span>
              ))}
              {checkedMenus.length > 2 && (
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '3px 0' }}>
                  +{checkedMenus.length - 2} more
                </span>
              )}
            </div>
          )}
          <button onClick={e => { e.stopPropagation(); onToggleCollapse(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${accent}40`, background: `${accent}08`, color: accent, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${accent}14`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${accent}08`; }}>
            <LuChevronDown size={14} /> Expand
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 20px 16px' }}>
          {Object.entries(menusByGroup).map(([group, items]) => {
            const GroupIcon = GROUP_ICONS[group] || LuFolder;
            const visibleItems = group === 'Settings & Logs' ? items.filter(m => m.path !== '/permissions' || roleName === 'admin') : items;
            if (visibleItems.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}><GroupIcon size={12} />{group}</div>
                  <ToggleSwitch checked={visibleItems.every(m => checkedMenuIds.has(m.id))} onChange={v => { visibleItems.forEach(m => onToggle(roleName, m.id, v)); }} accent={accent} size={14} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {visibleItems.map(menu => {
                    const isChecked = checkedMenuIds.has(menu.id);
                    return (
                      <label key={menu.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', borderRadius: 8, cursor: 'pointer', background: isChecked ? `${accent}06` : 'transparent', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = isChecked ? `${accent}10` : 'var(--hover-bg)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isChecked ? `${accent}06` : 'transparent'; }}>
                        <ToggleSwitch checked={isChecked} onChange={v => onToggle(roleName, menu.id, v)} accent={accent} size={16} />
                        <span style={{ fontSize: 13, fontWeight: isChecked ? 600 : 400, color: 'var(--text)' }}>{menu.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Permissions() {
  const [tabOrder, setTabOrder] = useState(loadTabOrder);
  const [tab, setTab] = useState('roles');

  const TABS = () => tabOrder.map(key => DEFAULT_TABS.find(t => t.key === key)).filter(Boolean);

  const [dragTab, setDragTab] = useState(null);

  const handleTabDragStart = (key) => (e) => {
    setDragTab(key);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  };
  const handleTabDragOver = (key) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleTabDrop = (targetKey) => (e) => {
    e.preventDefault();
    if (dragTab === null || dragTab === targetKey) return;
    const keys = [...tabOrder];
    const fromIdx = keys.indexOf(dragTab);
    const toIdx = keys.indexOf(targetKey);
    keys.splice(fromIdx, 1);
    keys.splice(toIdx, 0, dragTab);
    setTabOrder(keys);
    localStorage.setItem('perms_tab_order', JSON.stringify(keys));
    setDragTab(null);
  };
  const handleTabDragEnd = (key) => (e) => {
    e.currentTarget.style.opacity = '1';
    setDragTab(null);
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, data: null });
  const [dragItemId, setDragItemId] = useState(null);
  const [dragGroup, setDragGroup] = useState(null);

  const handleItemDragStart = (id, group) => (e) => {
    setDragItemId(id);
    setDragGroup(group);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.35';
  };
  const handleItemDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleItemDragEnd = (id) => (e) => {
    e.currentTarget.style.opacity = '1';
    setDragItemId(null);
    setDragGroup(null);
  };

  const handleRoleDrop = (targetId) => async (e) => {
    e.preventDefault();
    if (dragItemId === null || dragItemId === targetId) return;
    const fromIdx = roles.findIndex(r => r.id === dragItemId);
    const toIdx = roles.findIndex(r => r.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const updated = [...roles];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    const reordered = updated.map((r, i) => ({ ...r, sort_order: i + 1 }));
    setRoles(reordered);
    setDragItemId(null);
    try {
      await reorderRoles(reordered.map(r => ({ id: r.id, sort_order: r.sort_order })));
    } catch { showToast('Failed to save order', 'error'); }
  };

  const handleMenuDrop = (targetId) => async (e) => {
    e.preventDefault();
    if (dragItemId === null || dragGroup === null || dragItemId === targetId) return;
    const groupItems = menus.filter(m => m.group === dragGroup);
    const fromIdx = groupItems.findIndex(m => m.id === dragItemId);
    const toIdx = groupItems.findIndex(m => m.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const updated = [...groupItems];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    const reordered = updated.map((m, i) => ({ ...m, sort_order: i + 1 }));
    const groupMap = {};
    for (const m of reordered) groupMap[m.id] = m.sort_order;
    setMenus(menus.map(m => m.group === dragGroup && groupMap[m.id] !== undefined ? { ...m, sort_order: groupMap[m.id] } : m));
    setDragItemId(null);
    setDragGroup(null);
    try {
      await reorderMenus(reordered.map(m => ({ id: m.id, sort_order: m.sort_order })));
    } catch { showToast('Failed to save order', 'error'); }
  };

  const handlePermRoleDrop = (targetId) => async (e) => {
    e.preventDefault();
    if (dragItemId === null || dragItemId === targetId) return;
    const fromIdx = permRoles.findIndex(r => r.id === dragItemId);
    const toIdx = permRoles.findIndex(r => r.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const updated = [...permRoles];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    const reordered = updated.map((r, i) => ({ ...r, sort_order: i + 1 }));
    setPermRoles(reordered);
    setDragItemId(null);
    try {
      await reorderRoles(reordered.map(r => ({ id: r.id, sort_order: r.sort_order })));
    } catch { showToast('Failed to save order', 'error'); }
  };

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // Roles state
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', label: '', description: '' });
  const [roleSaving, setRoleSaving] = useState(false);

  // Menus state
  const [menus, setMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({ path: '', label: '', group: '', sort_order: 0 });
  const [menuSaving, setMenuSaving] = useState(false);

  // Permissions state
  const [permRoles, setPermRoles] = useState([]);
  const [menusByGroup, setMenusByGroup] = useState({});
  const [permissions, setPermissions] = useState({});
  const [permLoading, setPermLoading] = useState(true);
  const [permSaving, setPermSaving] = useState(false);
  const [collapsedRoles, setCollapsedRoles] = useState(() => new Set());

  useEffect(() => {
    if (permRoles.length > 0 && collapsedRoles.size === 0) {
      setCollapsedRoles(new Set(permRoles.map(r => r.name)));
    }
  }, [permRoles]);

  const toggleRoleCollapse = (roleName) => {
    setCollapsedRoles(prev => {
      const next = new Set(prev);
      if (next.has(roleName)) next.delete(roleName);
      else next.add(roleName);
      return next;
    });
  };

  // Initial data load per tab
  useEffect(() => {
    if (tab === 'roles') fetchRoles();
    else if (tab === 'menus') fetchMenus();
    else if (tab === 'permissions') fetchPermissions();
  }, [tab]);

  // ── Roles ──
  const fetchRoles = async () => {
    setRolesLoading(true);
    try { const res = await getRoles(); setRoles(res.data.roles); }
    catch { showToast('Failed to load roles', 'error'); }
    finally { setRolesLoading(false); }
  };

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', label: '', description: '' });
    setShowRoleModal(true);
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, label: role.label, description: role.description || '' });
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim() || !roleForm.label.trim()) { showToast('Name and label are required', 'error'); return; }
    setRoleSaving(true);
    try {
      if (editingRole) { await updateRole(editingRole.id, roleForm); showToast('Role updated'); }
      else { await createRole(roleForm); showToast('Role created'); }
      setShowRoleModal(false); fetchRoles();
    } catch (err) { showToast(err.response?.data?.error || 'Failed to save role', 'error'); }
    finally { setRoleSaving(false); }
  };

  const handleDeleteRole = async (role) => {
    setConfirmModal({ isOpen: true, type: 'role', data: role });
  };

  // ── Menus ──
  const fetchMenus = async () => {
    setMenusLoading(true);
    try { const res = await getMenus(); setMenus(res.data.menus); }
    catch { showToast('Failed to load menus', 'error'); }
    finally { setMenusLoading(false); }
  };

  const openCreateMenu = () => {
    setEditingMenu(null);
    setMenuForm({ path: '', label: '', group: '', sort_order: 0 });
    setShowMenuModal(true);
  };

  const openEditMenu = (menu) => {
    setEditingMenu(menu);
    setMenuForm({ path: menu.path, label: menu.label, group: menu.group, sort_order: menu.sort_order || 0 });
    setShowMenuModal(true);
  };

  const handleSaveMenu = async () => {
    if (!menuForm.path.trim() || !menuForm.label.trim() || !menuForm.group.trim()) { showToast('Path, label, and group are required', 'error'); return; }
    setMenuSaving(true);
    try {
      if (editingMenu) { await updateMenu(editingMenu.id, menuForm); showToast('Menu updated'); }
      else { await createMenu(menuForm); showToast('Menu created'); }
      setShowMenuModal(false); fetchMenus();
    } catch (err) { showToast(err.response?.data?.error || 'Failed to save menu', 'error'); }
    finally { setMenuSaving(false); }
  };

  const handleDeleteMenu = async (menu) => {
    setConfirmModal({ isOpen: true, type: 'menu', data: menu });
  };

  const groupedMenus = menus.reduce((acc, m) => {
    if (!acc[m.group]) acc[m.group] = [];
    acc[m.group].push(m);
    return acc;
  }, {});

  // ── Permissions ──
  const fetchPermissions = async () => {
    setPermLoading(true);
    try {
      const res = await getRolePermissions();
      const d = res.data;
      setPermRoles(d.roles);
      setMenusByGroup(d.menus);
      const pm = {};
      for (const r of d.roles) pm[r.name] = new Set((r.menus || []).map(m => m.id));
      setPermissions(pm);
    } catch { showToast('Failed to load permissions', 'error'); }
    finally { setPermLoading(false); }
  };

  const handleTogglePerm = (roleName, menuId, checked) => {
    setPermissions(prev => {
      const next = { ...prev };
      const set = new Set(prev[roleName] || []);
      checked ? set.add(menuId) : set.delete(menuId);
      next[roleName] = set;
      return next;
    });
  };

  const handleSavePerm = async () => {
    setPermSaving(true);
    try {
      const payload = permRoles.map(r => ({ role_id: r.id, menu_ids: Array.from(permissions[r.name] || []) }));
      await updateRolePermissions({ permissions: payload });
      showToast('Permissions saved');
    } catch { showToast('Failed to save permissions', 'error'); }
    finally { setPermSaving(false); }
  };

  // ── Rendering helpers ──
  const Spinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  function Modal({ title, children }) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={() => { setShowRoleModal(false); setShowMenuModal(false); }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1px solid var(--border-color)' }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
            <button onClick={() => { setShowRoleModal(false); setShowMenuModal(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}><LuX size={18} /></button>
          </div>
          {children}
        </div>
      </div>
    );
  }

  const primaryBtn = (onClick, disabled, label) => (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none',
      background: disabled ? 'var(--border-color)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
      color: '#fff', fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1,
    }}>
      {disabled ? <LuRefreshCw size={14} className="spinner" /> : <LuSave size={14} />}
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
          <LuShield size={22} style={{ color: 'var(--primary)' }} />
          Permissions
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
          Manage roles, menu items, and role menu access
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs-scroll" style={{ gap: 0, marginBottom: 24, borderBottomWidth: '2px' }}>
        {TABS().map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} draggable onDragStart={handleTabDragStart(t.key)} onDragOver={handleTabDragOver(t.key)} onDrop={handleTabDrop(t.key)} onDragEnd={handleTabDragEnd(t.key)} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', border: 'none', background: 'transparent',
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: active ? 700 : 600, fontSize: 13.5,
              cursor: 'grab', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.2s',
            }}>
              <t.icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Roles ── */}
      {tab === 'roles' && (
        rolesLoading ? <Spinner /> : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={openCreateRole} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 12px rgba(0,200,151,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                <LuPlus size={15} />Add Role
              </button>
            </div>
            <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: '0 1px 3px var(--shadow-color)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg)' }}>
                      <th style={{ width: 60, padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Order</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Label</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Description</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role, ri) => (
                      <tr key={role.id} draggable onDragStart={handleItemDragStart(role.id)} onDragOver={handleItemDragOver} onDrop={handleRoleDrop(role.id)} onDragEnd={handleItemDragEnd(role.id)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'grab', background: dragItemId === role.id ? 'var(--hover-bg)' : 'transparent', transition: 'background 0.15s' }}>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{ri + 1}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{role.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text)' }}>{role.label}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{role.description || '-'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => openEditRole(role)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: 6, fontSize: 12 }}><LuPencil size={13} /></button>
                          {role.name !== 'admin' && (
                            <button onClick={() => handleDeleteRole(role)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #EF444444', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: 12 }}><LuTrash2 size={13} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {showRoleModal && (
              <Modal title={editingRole ? 'Edit Role' : 'Add Role'}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Name *</label>
                  <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. support_agent"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Label *</label>
                  <input value={roleForm.label} onChange={e => setRoleForm({ ...roleForm, label: e.target.value })} placeholder="e.g. Support Agent"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Description</label>
                  <input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Optional"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowRoleModal(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                  {primaryBtn(handleSaveRole, roleSaving, editingRole ? 'Update' : 'Create')}
                </div>
              </Modal>
            )}
          </>
        )
      )}

      {/* ── Tab: Menu Items ── */}
      {tab === 'menus' && (
        menusLoading ? <Spinner /> : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={openCreateMenu} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 12px rgba(0,200,151,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                <LuPlus size={15} />Add Menu
              </button>
            </div>
            {Object.entries(groupedMenus).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', margin: '0 0 8px', padding: '0 4px' }}>{group}</h3>
                <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: '0 1px 3px var(--shadow-color)', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg)' }}>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Path</th>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Label</th>
                          <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Order</th>
                          <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(menu => (
                          <tr key={menu.id} draggable onDragStart={handleItemDragStart(menu.id, menu.group)} onDragOver={handleItemDragOver} onDrop={handleMenuDrop(menu.id)} onDragEnd={handleItemDragEnd(menu.id)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'grab', background: dragItemId === menu.id ? 'var(--hover-bg)' : 'transparent', transition: 'background 0.15s' }}>
                            <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>{menu.path}</td>
                            <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text)' }}>{menu.label}</td>
                            <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>{menu.sort_order}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                              <button onClick={() => openEditMenu(menu)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: 6, fontSize: 12 }}><LuPencil size={13} /></button>
                              <button onClick={() => handleDeleteMenu(menu)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #EF444444', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: 12 }}><LuTrash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
            {showMenuModal && (
              <Modal title={editingMenu ? 'Edit Menu' : 'Add Menu'}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Path *</label>
                  <input value={menuForm.path} onChange={e => setMenuForm({ ...menuForm, path: e.target.value })} placeholder="/example-path"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Label *</label>
                  <input value={menuForm.label} onChange={e => setMenuForm({ ...menuForm, label: e.target.value })} placeholder="Example Page"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Group *</label>
                  <input value={menuForm.group} onChange={e => setMenuForm({ ...menuForm, group: e.target.value })} placeholder="e.g. Management"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>Sort Order</label>
                  <input type="number" value={menuForm.sort_order} onChange={e => setMenuForm({ ...menuForm, sort_order: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowMenuModal(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Cancel</button>
                  {primaryBtn(handleSaveMenu, menuSaving, editingMenu ? 'Update' : 'Create')}
                </div>
              </Modal>
            )}
          </>
        )
      )}

      {/* ── Tab: Menu Permissions ── */}
      {tab === 'permissions' && (
        permLoading ? <Spinner /> : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button onClick={handleSavePerm} disabled={permSaving} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 22px', borderRadius: 10, border: 'none', cursor: permSaving ? 'not-allowed' : 'pointer',
                background: permSaving ? 'var(--border-color)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#fff', fontWeight: 600, fontSize: 13, boxShadow: permSaving ? 'none' : '0 4px 12px rgba(0,200,151,0.35)', opacity: permSaving ? 0.7 : 1, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!permSaving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                {permSaving ? <LuRefreshCw size={15} className="spinner" /> : <LuSave size={15} />}
                {permSaving ? 'Saving…' : 'Save Permissions'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {permRoles.map(role => (
                <div key={role.id} draggable onDragStart={handleItemDragStart(role.id)} onDragOver={handleItemDragOver} onDrop={handlePermRoleDrop(role.id)} onDragEnd={handleItemDragEnd(role.id)} style={{ cursor: 'grab', opacity: dragItemId === role.id ? 0.5 : 1, transition: 'opacity 0.15s' }}>
                  <RoleCard role={role} roleName={role.name} label={role.label} accent={ROLE_ACCENTS[role.name] || 'var(--primary)'}
                    menusByGroup={menusByGroup} checkedMenuIds={permissions[role.name] || new Set()} onToggle={handleTogglePerm}
                    collapsed={collapsedRoles.has(role.name)} onToggleCollapse={() => toggleRoleCollapse(role.name)} />
                </div>
              ))}
            </div>
          </>
        )
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, data: null })}
        onConfirm={async () => {
          const { type, data } = confirmModal;
          try {
            if (type === 'role') { await deleteRole(data.id); showToast('Role deleted'); fetchRoles(); }
            if (type === 'menu') { await deleteMenu(data.id); showToast('Menu deleted'); fetchMenus(); }
          } catch (err) {
            showToast(err.response?.data?.error || 'Failed to delete', 'error');
          } finally {
            setConfirmModal({ isOpen: false, type: null, data: null });
          }
        }}
        title={`Delete ${confirmModal.type === 'role' ? 'Role' : 'Menu'}`}
        message={`Are you sure you want to delete "${confirmModal.data?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      />

      {/* Toast */}
      {toast && (
        <div key={toast.id} style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000000, padding: '12px 18px', borderRadius: 12, background: toast.type === 'error' ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #00C897, #059669)', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 13, animation: 'toastSlideIn 0.35s ease-out', border: '1px solid rgba(255,255,255,0.1)', minWidth: 200 }}>
          {toast.type === 'error' ? <LuTriangleAlert size={18} /> : <LuCheck size={18} />}
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn { from { opacity: 0; transform: translateX(60px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
