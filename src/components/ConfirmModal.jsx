import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = 'btn-primary',
    showInput = false,
    inputPlaceholder = '',
    inputValue = '',
    onInputChange,
    suggestions = []
}) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(inputValue);
    };

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999999,
                padding: '1rem'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--card-bg)',
                    borderRadius: '1.25rem',
                    maxWidth: '450px',
                    width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    animation: 'modalSlideUp 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--hover-bg)'
                }}>
                    <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0)'}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.75rem 1.5rem' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        {message}
                    </p>

                    {showInput && (
                        <input
                            type="text"
                            placeholder={inputPlaceholder}
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            autoFocus
                            style={{ 
                                marginTop: '1.25rem', 
                                marginBottom: 0,
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid var(--border-color)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    )}

                    {showInput && suggestions.length > 0 && (
                        <div style={{ 
                            marginTop: '0.75rem', 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '0.5rem' 
                        }}>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => onInputChange(s)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '20px',
                                        padding: '0.35rem 0.75rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                        e.target.style.borderColor = 'var(--primary)';
                                        e.target.style.color = 'var(--white)';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                        e.target.style.borderColor = 'var(--border-color)';
                                        e.target.style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: 'var(--hover-bg)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-color)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`btn ${confirmButtonClass}`}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}