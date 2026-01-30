import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
        if (token && user.role) {
            redirectBasedOnRole(user.role);
        }
    }, [navigate]);

    const redirectBasedOnRole = (role) => {
        if (role === 'admin') {
            navigate('/dashboard');
        } else if (role === 'mediator') {
            navigate('/mediator/dashboard');
        } else {
            // Default fallback or handle other roles
            navigate('/dashboard');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;

            // Check if user has admin or mediator role
            if (user.role !== 'admin' && user.role !== 'mediator') {
                setError('Unauthorized: You do not have access to this panel.');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));

            redirectBasedOnRole(user.role);

        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#B47FFF' }}>
                    Login
                </h2>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
