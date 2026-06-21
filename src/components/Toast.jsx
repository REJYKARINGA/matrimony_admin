import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export function useToast() {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type, key: Date.now() });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const ToastComponent = () => toast ? createPortal(
        <div key={toast.key} style={{
            position: 'fixed', top: '5rem', right: '1.5rem', zIndex: 100000,
            padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
            background: toast.type === 'error' ? '#EF4444' : '#10B981', color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'toastSlideIn 0.3s ease-out'
        }}>
            {toast.msg}
        </div>,
        document.body
    ) : null;

    return { toast, showToast, ToastComponent };
}
