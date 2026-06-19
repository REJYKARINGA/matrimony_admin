import { useState, useEffect } from 'react';
import { getThemeSettings, updateThemeSettings } from '../api/themeSettingsApi';
import {
  LuPalette, LuSave, LuCheck, LuTriangleAlert,
  LuSun, LuMoon, LuRefreshCw, LuEye
} from 'react-icons/lu';

function SectionCard({ icon: Icon, title, desc, children, accent }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 16, border: '1px solid var(--border-color)',
      boxShadow: '0 1px 3px var(--shadow-color), 0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      animation: 'fadeInUp 0.4s ease-out both',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${accent || 'var(--primary)'}, ${accent || 'var(--secondary)'})`,
          color: '#fff', fontSize: 16,
        }}>
          <Icon />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{title}</div>
          {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{desc}</div>}
        </div>
      </div>
      <div style={{ padding: '16px 20px 20px' }}>{children}</div>
    </div>
  );
}

function ColorField({ label, desc, value, onChange }) {
  const [customHex, setCustomHex] = useState(value);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => { setCustomHex(value); }, [value]);

  const presets = ['#00C897', '#00A87D', '#00875F', '#0EA5E9', '#6366F1', '#8B5CF6', '#F59E0B', '#EF4444', '#22C55E', '#3B82F6', '#EC4899', '#F97316'];

  const isValidHex = (h) => /^#[0-9A-Fa-f]{6}$/.test(h);

  return (
    <div style={{
      background: 'var(--bg)', borderRadius: 12,
      padding: '16px', border: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: isValidHex(value) ? value : '#ccc',
          border: '2px solid var(--border-color)',
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</div>
          {desc && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 1 }}>{desc}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {presets.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => { onChange(p); setCustomHex(p); setShowCustom(false); }}
            style={{
              width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: p,
              boxShadow: value === p ? '0 0 0 2px var(--primary), 0 0 0 4px rgba(0,200,151,0.2)' : '0 1px 3px rgba(0,0,0,0.15)',
              transition: 'all 0.15s',
              outline: 'none',
            }}
            title={p}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {showCustom ? (
          <>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>#</span>
            <input
              type="text"
              maxLength={6}
              placeholder="FF8800"
              value={customHex?.replace('#', '') || ''}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
                const val = `#${raw}`;
                setCustomHex(val);
                if (raw.length === 6) onChange(val);
              }}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-color)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: 13, fontWeight: 600,
                fontFamily: 'monospace', textTransform: 'uppercase',
                outline: 'none',
              }}
              onBlur={() => { if (isValidHex(customHex)) onChange(customHex); }}
            />
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                background: 'var(--bg)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)',
              }}
            >Done</button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-color)',
              background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >+ Custom</button>
        )}
      </div>

      <input type="hidden" value={value} />
    </div>
  );
}

export default function ThemeSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    primary_color: '#00C897',
    secondary_color: '#00A87D',
    background_color: '#F5FBF9',
    surface_color: '#FFFFFF',
    text_color: '#212121',
    gradient_start: '#00C897',
    gradient_end: '#00A87D',
    dark_primary: '#42A5F5',
    dark_secondary: '#64B5F6',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const response = await getThemeSettings();
      const s = response.data.theme;
      setFormData({
        primary_color: s.primary_color || '#00C897',
        secondary_color: s.secondary_color || '#00A87D',
        background_color: s.background_color || '#F5FBF9',
        surface_color: s.surface_color || '#FFFFFF',
        text_color: s.text_color || '#212121',
        gradient_start: s.gradient_start || '#00C897',
        gradient_end: s.gradient_end || '#00A87D',
        dark_primary: s.dark_primary || '#42A5F5',
        dark_secondary: s.dark_secondary || '#64B5F6',
      });
    } catch (error) {
      console.error('Failed to fetch theme settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateThemeSettings(formData);
      showToast('Theme settings saved successfully');
    } catch (error) {
      console.error('Failed to save theme settings:', error);
      showToast('Failed to save theme settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'var(--card-bg)', borderRadius: 16,
            border: '1px solid var(--border-color)', padding: 24,
            animation: 'pulse 1.5s ease-in-out infinite',
            opacity: 0.6,
          }}>
            <div style={{ width: '40%', height: 18, borderRadius: 6, background: 'var(--border-color)', marginBottom: 16 }} />
            <div style={{ width: '100%', height: 12, borderRadius: 6, background: 'var(--border-color)', marginBottom: 8 }} />
            <div style={{ width: '70%', height: 12, borderRadius: 6, background: 'var(--border-color)' }} />
          </div>
        ))}
      </div>
    );
  }

  const livePreview = {
    primary: formData.primary_color,
    secondary: formData.secondary_color,
    background: formData.background_color,
    surface: formData.surface_color,
    text: formData.text_color,
    gradientStart: formData.gradient_start,
    gradientEnd: formData.gradient_end,
  };

  return (
    <form onSubmit={handleSave}>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${livePreview.primary}, ${livePreview.gradientEnd})`,
              color: '#fff', fontSize: 22,
              boxShadow: `0 8px 24px ${livePreview.primary}44`,
            }}>
              <LuPalette />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>Theme Settings</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                Customize app colors and gradients — changes apply instantly on next app load
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12,
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              background: saving
                ? 'var(--border-color)'
                : `linear-gradient(135deg, ${livePreview.primary}, ${livePreview.gradientEnd})`,
              color: '#fff', fontWeight: 600, fontSize: 13.5,
              boxShadow: saving ? 'none' : `0 4px 14px ${livePreview.primary}55`,
              transition: 'all 0.2s',
              opacity: saving ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            {saving ? <LuRefreshCw size={16} className="spinner" /> : <LuSave size={16} />}
            {saving ? 'Saving…' : 'Save Theme'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Live Preview */}
        <SectionCard
          icon={LuEye}
          title="Live Preview"
          desc="See how your colors look together"
          accent={livePreview.primary}
        >
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border-color)',
          }}>
            {/* App Bar Preview */}
            <div style={{
              padding: '14px 20px',
              background: `linear-gradient(135deg, ${livePreview.primary}, ${livePreview.gradientEnd})`,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Nikkah Match</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ opacity: 0.9 }}>❤</span>
                <span style={{ opacity: 0.9 }}>🔍</span>
                <span style={{ opacity: 0.9 }}>☰</span>
              </div>
            </div>
            {/* Body Preview */}
            <div style={{
              padding: 20,
              background: livePreview.background,
              color: livePreview.text,
            }}>
              <div style={{
                background: livePreview.surface, borderRadius: 12, padding: 16,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>User Profile Card</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>This is how a card will look with your theme colors.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: livePreview.primary, color: '#fff',
                  }}>View Profile</span>
                  <span style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: 'transparent', color: livePreview.primary, border: `1.5px solid ${livePreview.primary}`,
                  }}>Send Interest</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Light Theme Colors */}
        <SectionCard
          icon={LuSun}
          title="Light Theme"
          desc="Colors used in light mode"
          accent="#F59E0B"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}>
            <ColorField
              label="Primary Color"
              desc="Main brand color — buttons, app bar, links"
              value={formData.primary_color}
              onChange={(v) => setFormData({ ...formData, primary_color: v, gradient_start: v })}
            />
            <ColorField
              label="Secondary Color"
              desc="Supporting brand accent"
              value={formData.secondary_color}
              onChange={(v) => setFormData({ ...formData, secondary_color: v, gradient_end: v })}
            />
            <ColorField
              label="Background Color"
              desc="Page/screen background"
              value={formData.background_color}
              onChange={(v) => setFormData({ ...formData, background_color: v })}
            />
            <ColorField
              label="Surface Color"
              desc="Card, input, and sheet backgrounds"
              value={formData.surface_color}
              onChange={(v) => setFormData({ ...formData, surface_color: v })}
            />
            <ColorField
              label="Text Color"
              desc="Primary text color on light backgrounds"
              value={formData.text_color}
              onChange={(v) => setFormData({ ...formData, text_color: v })}
            />
            <ColorField
              label="Gradient Start"
              desc="Left/top color of gradient"
              value={formData.gradient_start}
              onChange={(v) => setFormData({ ...formData, gradient_start: v })}
            />
            <ColorField
              label="Gradient End"
              desc="Right/bottom color of gradient"
              value={formData.gradient_end}
              onChange={(v) => setFormData({ ...formData, gradient_end: v })}
            />
          </div>
        </SectionCard>

        {/* Dark Theme Colors */}
        <SectionCard
          icon={LuMoon}
          title="Dark Theme"
          desc="Colors used in dark mode"
          accent="#6366F1"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}>
            <ColorField
              label="Dark Primary"
              desc="Primary color in dark mode"
              value={formData.dark_primary}
              onChange={(v) => setFormData({ ...formData, dark_primary: v })}
            />
            <ColorField
              label="Dark Secondary"
              desc="Secondary color in dark mode"
              value={formData.dark_secondary}
              onChange={(v) => setFormData({ ...formData, dark_secondary: v })}
            />
          </div>
        </SectionCard>
      </div>

      <div style={{ height: 60 }} />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'flex-end',
        padding: '12px 20px',
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14,
          padding: '10px 24px', borderRadius: 14,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          pointerEvents: 'auto',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Colors update on next app startup
          </div>
          <div style={{ width: 1, height: 22, background: 'var(--border-color)' }} />
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 20px', borderRadius: 9,
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              background: saving
                ? 'var(--border-color)'
                : `linear-gradient(135deg, ${livePreview.primary}, ${livePreview.gradientEnd})`,
              color: '#fff', fontWeight: 600, fontSize: 13,
              boxShadow: saving ? 'none' : `0 4px 12px ${livePreview.primary}55`,
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            {saving ? <LuRefreshCw size={15} className="spinner" /> : <LuSave size={15} />}
            {saving ? 'Saving…' : 'Save Theme'}
          </button>
        </div>
      </div>

      {toast && (
        <div key={toast.id} style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000000,
          padding: '12px 18px', borderRadius: 12,
          background: toast.type === 'error'
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : `linear-gradient(135deg, ${livePreview.primary}, ${livePreview.gradientEnd})`,
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
