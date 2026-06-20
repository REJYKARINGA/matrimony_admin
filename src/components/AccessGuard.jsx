import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LuTriangleAlert } from 'react-icons/lu';
import { onPermissionDenied } from '../api/permissionGuard';

export default function AccessGuard({ error: propError, children }) {
  const [globalError, setGlobalError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setGlobalError(null);
  }, [location]);

  useEffect(() => {
    const unsub = onPermissionDenied(data => setGlobalError(data));
    return unsub;
  }, []);

  const error = propError || globalError;
  if (!error) return children;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', textAlign: 'center', gap: 16,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#EF444415', color: '#EF4444', fontSize: 28,
      }}>
        <LuTriangleAlert size={28} />
      </div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Access Denied</h2>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400 }}>
        {error.error || 'You do not have permission to access this page.'}
      </p>
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '6px 14px', borderRadius: 8, background: 'var(--hover-bg)',
        fontSize: 12, color: 'var(--text-secondary)',
      }}>
        <span style={{ fontWeight: 600 }}>Role:</span> {error.role}
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ fontWeight: 600 }}>Required:</span> {error.required_menu}
      </div>
    </div>
  );
}
