import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MediatorDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        window.location.href = '/';
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            color: 'var(--text)'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#B47FFF' }}>Hello Mediator</h1>
            <button
                onClick={handleLogout}
                className="btn btn-primary"
            >
                Logout
            </button>
        </div>
    );
}
