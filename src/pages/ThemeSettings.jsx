import { useState, useEffect } from 'react';
import { getThemeSettings, updateThemeSettings } from '../api/themeSettingsApi';
import {
  LuPalette, LuSave, LuCheck, LuTriangleAlert,
  LuSun, LuMoon, LuRefreshCw, LuEye, LuRotateCcw, LuUndo2
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

function ColorField({ label, desc, value, onChange, defaultValue }) {
  const [customHex, setCustomHex] = useState(value);
  const [showCustom, setShowCustom] = useState(false);
  const [history, setHistory] = useState([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => { setCustomHex(value); }, [value]);

  const presets = ['#00C897', '#00A87D', '#00875F', '#0EA5E9', '#6366F1', '#8B5CF6', '#F59E0B', '#EF4444', '#22C55E', '#3B82F6', '#EC4899', '#F97316'];

  const isValidHex = (h) => /^#[0-9A-Fa-f]{6}$/.test(h);

  const applyColor = (color) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(color);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onChange(color);
    setCustomHex(color);
    setShowCustom(false);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
      setCustomHex(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
      setCustomHex(history[newIndex]);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const isChanged = defaultValue !== undefined && value !== defaultValue;

  return (
    <div style={{
      background: 'var(--bg)', borderRadius: 12,
      padding: '16px', border: '1px solid var(--border-color)',
      position: 'relative',
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
            onClick={() => { applyColor(p); }}
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
                if (raw.length === 6) applyColor(val);
              }}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-color)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: 13, fontWeight: 600,
                fontFamily: 'monospace', textTransform: 'uppercase',
                outline: 'none',
              }}
              onBlur={() => { if (isValidHex(customHex)) applyColor(customHex); }}
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
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-color)',
                background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >+ Custom</button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              style={{
                padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)',
                background: 'transparent', cursor: canUndo ? 'pointer' : 'default',
                fontSize: 12, color: canUndo ? 'var(--text-secondary)' : 'var(--border-color)',
                opacity: canUndo ? 1 : 0.4, display: 'flex', alignItems: 'center',
              }}
            ><LuUndo2 size={13} /></button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              style={{
                padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)',
                background: 'transparent', cursor: canRedo ? 'pointer' : 'default',
                fontSize: 12, color: canRedo ? 'var(--text-secondary)' : 'var(--border-color)',
                opacity: canRedo ? 1 : 0.4, display: 'flex', alignItems: 'center',
              }}
            ><LuRotateCcw size={13} style={{ transform: 'scaleX(-1)' }} /></button>
            {isChanged && (
              <button
                type="button"
                onClick={() => applyColor(defaultValue)}
                title="Reset to default"
                style={{
                  padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 12, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center',
                }}
              ><LuRotateCcw size={13} /></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ThemeSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [previewMode, setPreviewMode] = useState('light');
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

  const DEFAULTS = {
    primary_color: '#00C897',
    secondary_color: '#00A87D',
    background_color: '#F5FBF9',
    surface_color: '#FFFFFF',
    text_color: '#212121',
    gradient_start: '#00C897',
    gradient_end: '#00A87D',
    dark_primary: '#42A5F5',
    dark_secondary: '#64B5F6',
  };

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

  const handleReset = () => {
    setFormData({ ...DEFAULTS });
    showToast('Colors reset to defaults — click Save to apply');
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

  const isDark = previewMode === 'dark';
  const livePreview = {
    primary: isDark ? formData.dark_primary : formData.primary_color,
    secondary: isDark ? formData.dark_secondary : formData.secondary_color,
    background: isDark ? '#121212' : formData.background_color,
    surface: isDark ? '#1E1E1E' : formData.surface_color,
    text: isDark ? '#F3F4F6' : formData.text_color,
    gradientStart: isDark ? formData.dark_primary : formData.gradient_start,
    gradientEnd: isDark ? formData.dark_secondary : formData.gradient_end,
    darkPrimary: formData.dark_primary,
    darkSecondary: formData.dark_secondary,
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12,
                border: '1px solid var(--border-color)',
                cursor: saving ? 'not-allowed' : 'pointer',
                background: 'transparent',
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13.5,
                transition: 'all 0.2s',
                opacity: saving ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              <LuRotateCcw size={16} />
              Reset
            </button>
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
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        {/* Mobile Phone Preview */}
        <div style={{ flex: '0 0 auto', width: '380px', maxWidth: '100%', order: 2, position: 'sticky', top: 24 }}>
        <SectionCard
          icon={LuEye}
          title="Live Mobile Preview"
          desc="Real-time preview of how your colors look in the app"
          accent={livePreview.primary}
        >
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            {/* Phone Frame */}
            <div style={{
              width: 280,
              background: '#1a1a1a',
              borderRadius: 44,
              padding: '12px 10px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px #333, inset 0 0 0 2px #444',
              position: 'relative',
            }}>
              {/* Notch / Dynamic Island */}
              <div style={{
                position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
                width: 90, height: 26, background: '#000',
                borderRadius: 20, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#222', border: '1.5px solid #333' }} />
              </div>

              {/* Screen */}
              <div style={{
                borderRadius: 36,
                overflow: 'hidden',
                background: livePreview.background,
                height: 560,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}>
                {/* Status Bar */}
                <div style={{
                  background: `linear-gradient(135deg, ${livePreview.gradientStart}, ${livePreview.gradientEnd})`,
                  padding: '28px 16px 10px',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 1 }}>Hey, Reji!</div>
                      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>Let's Find A Match</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div 
                        onClick={() => setPreviewMode(m => m === 'light' ? 'dark' : 'light')}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                        {previewMode === 'light' ? <LuMoon size={14} color="#fff" /> : <LuSun size={14} color="#fff" />}
                      </div>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13,
                      }}>🔔</div>
                    </div>
                  </div>

                  {/* Tab bar in header */}
                  <div style={{
                    display: 'flex', gap: 6,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 20, padding: '3px',
                  }}>
                    {['My Search', 'My Match', 'New'].map((tab, i) => (
                      <div key={tab} style={{
                        flex: 1, textAlign: 'center',
                        padding: '4px 0',
                        borderRadius: 16,
                        background: i === 0 ? '#fff' : 'transparent',
                        color: i === 0 ? livePreview.primary : 'rgba(255,255,255,0.85)',
                        fontSize: 10, fontWeight: i === 0 ? 700 : 500,
                        transition: 'all 0.2s',
                      }}>{tab}</div>
                    ))}
                  </div>
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflowY: 'hidden', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                  {/* Recent Visitors Label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: livePreview.text }}>Recent Visitors</div>
                    <div style={{ fontSize: 10, color: livePreview.primary, fontWeight: 600 }}>See all</div>
                  </div>

                  {/* Profile Card 1 */}
                  <div style={{
                    background: livePreview.surface,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 72, height: 88,
                      background: `linear-gradient(135deg, ${livePreview.gradientStart}33, ${livePreview.gradientEnd}55)`,
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28,
                    }}>👩</div>
                    <div style={{ padding: '10px 10px', flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: livePreview.text, marginBottom: 2 }}>Sarah, 26</div>
                      <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>Software Engineer • Kochi</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 10, fontSize: 9.5, fontWeight: 600,
                          background: livePreview.primary, color: '#fff',
                        }}>Interest ❤</span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 10, fontSize: 9.5, fontWeight: 600,
                          border: `1.5px solid ${livePreview.primary}`,
                          color: livePreview.primary, background: 'transparent',
                        }}>View</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Card 2 */}
                  <div style={{
                    background: livePreview.surface,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 72, height: 88,
                      background: `linear-gradient(135deg, ${livePreview.gradientEnd}33, ${livePreview.gradientStart}55)`,
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28,
                    }}>👩‍🦱</div>
                    <div style={{ padding: '10px 10px', flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: livePreview.text, marginBottom: 2 }}>Amina, 24</div>
                      <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>Doctor • Malappuram</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 10, fontSize: 9.5, fontWeight: 600,
                          background: livePreview.primary, color: '#fff',
                        }}>Interest ❤</span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 10, fontSize: 9.5, fontWeight: 600,
                          border: `1.5px solid ${livePreview.primary}`,
                          color: livePreview.primary, background: 'transparent',
                        }}>View</span>
                      </div>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div style={{
                    background: livePreview.surface,
                    borderRadius: 12, padding: '8px 12px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    border: `1px solid ${livePreview.primary}33`,
                    flexShrink: 0,
                  }}>
                    <span style={{ color: livePreview.primary, fontSize: 13 }}>🔍</span>
                    <span style={{ fontSize: 10, color: '#aaa' }}>Search by Matrimony ID...</span>
                  </div>
                </div>

                {/* Bottom Nav */}
                <div style={{
                  background: livePreview.surface,
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  padding: '8px 0 12px',
                  display: 'flex',
                  flexShrink: 0,
                }}>
                  {[
                    { icon: '🏠', label: 'Home', active: true },
                    { icon: '🔍', label: 'Search', active: false },
                    { icon: '❤', label: 'Match', active: false },
                    { icon: '💬', label: 'Chat', active: false },
                    { icon: '👤', label: 'Profile', active: false },
                  ].map(item => (
                    <div key={item.label} style={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 3,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: item.active ? `${livePreview.primary}18` : 'transparent',
                        fontSize: 14,
                      }}>{item.icon}</div>
                      <div style={{
                        fontSize: 8.5, fontWeight: item.active ? 700 : 500,
                        color: item.active ? livePreview.primary : '#aaa',
                      }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color strip below phone */}
          <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Primary', color: livePreview.primary },
              { label: 'Secondary', color: livePreview.secondary },
              { label: 'Background', color: livePreview.background },
              { label: 'Surface', color: livePreview.surface },
              { label: 'Text', color: livePreview.text },
              { label: 'Grad. Start', color: livePreview.gradientStart },
              { label: 'Grad. End', color: livePreview.gradientEnd },
              { label: 'Dark Pri.', color: livePreview.darkPrimary },
              { label: 'Dark Sec.', color: livePreview.darkSecondary },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 4,
                  background: item.color,
                  border: '1px solid var(--border-color)',
                }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        </div>

        {/* Left Column for Colors */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 20, order: 1 }}>
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
              defaultValue={DEFAULTS.primary_color}
              onChange={(v) => setFormData({ ...formData, primary_color: v, gradient_start: v })}
            />
            <ColorField
              label="Secondary Color"
              desc="Supporting brand accent"
              value={formData.secondary_color}
              defaultValue={DEFAULTS.secondary_color}
              onChange={(v) => setFormData({ ...formData, secondary_color: v, gradient_end: v })}
            />
            <ColorField
              label="Background Color"
              desc="Page/screen background"
              value={formData.background_color}
              defaultValue={DEFAULTS.background_color}
              onChange={(v) => setFormData({ ...formData, background_color: v })}
            />
            <ColorField
              label="Surface Color"
              desc="Card, input, and sheet backgrounds"
              value={formData.surface_color}
              defaultValue={DEFAULTS.surface_color}
              onChange={(v) => setFormData({ ...formData, surface_color: v })}
            />
            <ColorField
              label="Text Color"
              desc="Primary text color on light backgrounds"
              value={formData.text_color}
              defaultValue={DEFAULTS.text_color}
              onChange={(v) => setFormData({ ...formData, text_color: v })}
            />
            <ColorField
              label="Gradient Start"
              desc="Left/top color of gradient"
              value={formData.gradient_start}
              defaultValue={DEFAULTS.gradient_start}
              onChange={(v) => setFormData({ ...formData, gradient_start: v })}
            />
            <ColorField
              label="Gradient End"
              desc="Right/bottom color of gradient"
              value={formData.gradient_end}
              defaultValue={DEFAULTS.gradient_end}
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
              defaultValue={DEFAULTS.dark_primary}
              onChange={(v) => setFormData({ ...formData, dark_primary: v })}
            />
            <ColorField
              label="Dark Secondary"
              desc="Secondary color in dark mode"
              value={formData.dark_secondary}
              defaultValue={DEFAULTS.dark_secondary}
              onChange={(v) => setFormData({ ...formData, dark_secondary: v })}
            />
          </div>
        </SectionCard>
        </div>
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
            type="button"
            onClick={handleReset}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 9,
              border: '1px solid var(--border-color)',
              cursor: saving ? 'not-allowed' : 'pointer',
              background: 'transparent',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13,
              opacity: saving ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text)'; } }}
            onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
          >
            <LuRotateCcw size={14} />
            Reset
          </button>
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
