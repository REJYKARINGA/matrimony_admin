import { useEffect } from 'react';
import { FaTimes, FaCircleNotch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormModal({
    isOpen,
    onClose,
    title,
    onSubmit,
    children,
    submitText = 'Save Changes',
    maxWidth = '600px',
    isLoading = false
}) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.55)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(6px)',
                        padding: '1rem'
                    }}
                >
                    <motion.div
                        className="modal-content"
                        style={{
                            background: 'var(--card-bg)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                            maxWidth,
                            width: '100%',
                            maxHeight: '85vh',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid var(--border-color)'
                        }}
                        initial={{ scale: 0.97, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.97, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            zIndex: 10
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '1.15rem',
                                fontWeight: '700',
                                color: 'var(--text)',
                                letterSpacing: '-0.01em'
                            }}>{title}</h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'var(--hover-bg)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    color: 'var(--text-secondary)',
                                    padding: '6px',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#EF4444';
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.background = 'var(--hover-bg)';
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="modal-body" style={{
                            padding: '1.5rem',
                            overflowY: 'auto',
                            maxHeight: 'calc(85vh - 130px)',
                            scrollbarWidth: 'thin'
                        }}>
                            <form id="modal-form" onSubmit={onSubmit} style={{ fontSize: '0.875rem' }}>
                                {children}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="modal-actions" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.75rem',
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            marginTop: 'auto',
                            zIndex: 10
                        }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="modal-form"
                                disabled={isLoading}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(180, 127, 255, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(180, 127, 255, 0.35)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(180, 127, 255, 0.25)';
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <FaCircleNotch className="fa-spin" style={{ fontSize: '0.75rem' }} />
                                        <span>Saving...</span>
                                    </>
                                ) : submitText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
