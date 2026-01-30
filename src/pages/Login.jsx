import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [loginType, setLoginType] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
        if (token) {
            if (user.role === 'mediator') {
                navigate('/mediator/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });

            const { user, token } = response.data;

            if (loginType === 'admin') {
                if (user.role !== 'admin') {
                    setError('Unauthorized: Admin access only.');
                    return;
                }
                navigate('/dashboard');
            } else {
                // Assuming mediator role is checked here. 
                // Since user didn't specify strict role name, assuming 'mediator' based on context
                if (user.role !== 'mediator' && user.role !== 'admin') { // Admin can likely login as mediator too for testing? Or maybe strictly mediator.
                    // A safer check: verify role matches intent
                    if (user.role !== 'mediator') {
                        setError('Unauthorized: Mediator access only.');
                        return;
                    }
                }
                navigate('/mediator/dashboard');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));

        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#B47FFF' }}>
                    {loginType === 'admin' ? 'Admin Login' : 'Mediator Login'}
                </h2>

                <div style={{
                    display: 'flex',
                    background: 'var(--bg)',
                    padding: '4px',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    gap: '4px'
                }}>
                    <button
                        type="button"
                        onClick={() => setLoginType('admin')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: 'none',
                            borderRadius: '6px',
                            background: loginType === 'admin' ? 'var(--primary)' : 'transparent',
                            color: loginType === 'admin' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => setLoginType('mediator')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: 'none',
                            borderRadius: '6px',
                            background: loginType === 'mediator' ? 'var(--primary)' : 'transparent',
                            color: loginType === 'mediator' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        Mediator
                    </button>
                </div>

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
