import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
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
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(3px)'
                    }}
                >
                    <motion.div
                        className="modal-content"
                        style={{
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            maxWidth,
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 0,
                            position: 'sticky',
                            top: 0,
                            background: 'var(--card-bg)',
                            zIndex: 10,
                            padding: '1.5rem 1.5rem 1rem',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    color: 'var(--text-secondary)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={onSubmit}>
                            <div className="modal-body" style={{ padding: '1.5rem 1.5rem 6rem' }}>
                                {children}
                            </div>

                            <div className="modal-actions" style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem',
                                padding: '1rem 1.5rem 1.5rem',
                                borderTop: '1px solid var(--border-color)',
                                position: 'sticky',
                                bottom: 0,
                                background: 'var(--card-bg)',
                                marginTop: 'auto',
                                zIndex: 10
                            }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : submitText}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
