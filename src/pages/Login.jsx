import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            navigate('/dashboard');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Custom Validation
        let errors = { email: '', password: '' };
        let isValid = true;

        if (!email.trim()) {
            errors.email = 'Please fill out email field.';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email address.';
            isValid = false;
        }

        if (!password.trim()) {
            errors.password = 'Please fill out password field.';
            isValid = false;
        }

        setFormErrors(errors);
        if (!isValid) return;

        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;
            if (user.role !== 'admin' && user.role !== 'mediator') {
                setError('Unauthorized: You do not have access to this panel.');
                setIsLoading(false);
                return;
            }
            localStorage.setItem('token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));
            redirectBasedOnRole(user.role);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: #bbb; }

                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #dce8f5;
                    padding: 20px;
                    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    box-sizing: border-box;
                }

                .login-card {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    max-width: 860px;
                    min-height: 520px;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
                }

                .login-left {
                    flex: 0 0 42%;
                    background: linear-gradient(160deg, #1565c0 0%, #1e88e5 60%, #42a5f5 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    padding: 40px 28px 24px;
                    position: relative;
                    overflow: hidden;
                }

                .wave-svg {
                    position: absolute;
                    right: -1px;
                    top: 0;
                    height: 100%;
                    width: 80px;
                    z-index: 3;
                }

                .login-right {
                    flex: 1;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 48px 44px;
                }

                .login-input {
                    width: 100%;
                    padding: 10px 36px 10px 8px;
                    font-size: 14px;
                    border: none;
                    border-bottom: 2px solid #90caf9;
                    outline: none;
                    background: transparent;
                    color: #333;
                    box-sizing: border-box;
                    transition: border-color 0.25s;
                }
                .login-input:focus { border-bottom-color: #1565c0; }

                .btn-signin {
                    flex: 1;
                    padding: 11px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    background: linear-gradient(135deg, #1565c0 0%, #1e88e5 100%);
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(21,101,192,0.35);
                    transition: box-shadow 0.25s;
                }
                .btn-signin:disabled { background: #90caf9; cursor: not-allowed; }
                .btn-signin:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(21,101,192,0.5); }

                .btn-signup {
                    flex: 1;
                    padding: 11px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1565c0;
                    background: white;
                    border: 2px solid #1565c0;
                    border-radius: 25px;
                    cursor: pointer;
                    transition: background 0.25s;
                }
                .btn-signup:hover { background: #f0f5ff; }

                /* ── MOBILE: stack vertically ── */
                @media (max-width: 600px) {
                    .login-card {
                        flex-direction: column;
                        min-height: unset;
                        border-radius: 16px;
                        max-width: 100%;
                    }

                    .login-left {
                        flex: none;
                        width: 100%;
                        padding: 32px 24px 56px;
                        box-sizing: border-box;
                        border-radius: 16px 16px 0 0;
                        justify-content: center;
                        gap: 16px;
                    }

                    /* Hide the right-side wave on mobile */
                    .wave-svg { display: none; }

                    /* Bottom rounded wave into white panel */
                    .login-left::after {
                        content: '';
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        width: 100%;
                        height: 44px;
                        background: white;
                        border-radius: 50% 50% 0 0 / 100% 100% 0 0;
                    }

                    .login-right {
                        flex: none;
                        width: 100%;
                        padding: 28px 24px 36px;
                        box-sizing: border-box;
                        border-radius: 0 0 16px 16px;
                    }

                    .left-desc { display: none !important; }
                    .left-footer { display: none !important; }
                }
            `}</style>

            <div className="login-wrapper">
                <div className="login-card">

                    {/* LEFT BLUE PANEL */}
                    <div className="login-left">
                        <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
                            <p style={{ margin: '0 0 16px', fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                                Welcome to
                            </p>
                            <div style={{
                                width: '76px', height: '76px', background: 'white',
                                borderRadius: '50%', margin: '0 auto 14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
                            }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="10" r="6" fill="#1565c0" />
                                    <circle cx="12" cy="10" r="2.5" fill="white" />
                                    <path d="M12 16 L9 22 L12 20 L15 22 Z" fill="#1565c0" />
                                </svg>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'white' }}>
                                Admin Panel
                            </h2>
                        </div>

                        <p className="left-desc" style={{
                            zIndex: 2, position: 'relative',
                            fontSize: '12.5px', color: 'rgba(255,255,255,0.8)',
                            lineHeight: '1.7', textAlign: 'center', margin: '20px 0 0'
                        }}>
                            Manage your platform securely. Sign in with your admin or mediator credentials to access the dashboard and tools.
                        </p>

                        <div className="left-footer" style={{
                            zIndex: 2, position: 'relative',
                            display: 'flex', gap: '16px', marginTop: '24px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                ADMIN <strong style={{ color: 'rgba(255,255,255,0.9)' }}>PORTAL</strong>
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                SECURE <strong style={{ color: 'rgba(255,255,255,0.9)' }}>LOGIN</strong>
                            </span>
                        </div>

                        {/* Desktop wave */}
                        <svg className="wave-svg" viewBox="0 0 80 520" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                            <path d="M80,0 C60,0 40,30 55,80 C70,130 80,150 65,200 C50,250 30,270 50,330 C70,390 80,400 60,450 C40,500 55,510 80,520 L80,0Z" fill="white" />
                            <path d="M80,0 C65,10 50,40 62,90 C74,140 80,160 68,210 C56,260 38,280 55,340 C72,400 80,410 62,460 C44,510 60,516 80,520 L80,0Z" fill="rgba(255,255,255,0.15)" />
                        </svg>
                    </div>

                    {/* RIGHT WHITE PANEL */}
                    <div className="login-right">
                        <h2 style={{ margin: '0 0 28px', fontSize: '26px', fontWeight: 700, color: '#1a1a2e', textAlign: 'center' }}>
                            Sign In
                        </h2>

                        {error && (
                            <div style={{
                                background: '#fff0f0', border: '1px solid #ffcccc',
                                borderRadius: '8px', padding: '10px 14px', marginBottom: '18px',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#cc3333" />
                                </svg>
                                <span style={{ fontSize: '13px', color: '#cc3333' }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} noValidate>
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                                    E-mail Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                                        }}
                                        placeholder="Enter your email" 
                                        className="login-input" 
                                        style={{ borderBottomColor: formErrors.email ? '#dc3545' : '#90caf9' }}
                                    />
                                    <svg style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 12l2 2 4-4" stroke={formErrors.email ? '#dc3545' : '#90caf9'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {formErrors.email && <div style={{ color: '#dc3545', fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>{formErrors.email}</div>}
                            </div>

                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#333' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password} 
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                                        }}
                                        placeholder="Enter your password" 
                                        className="login-input" 
                                        style={{ borderBottomColor: formErrors.password ? '#dc3545' : '#90caf9' }}
                                    />
                                    <div 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ 
                                            position: 'absolute', 
                                            right: 4, 
                                            top: '50%', 
                                            transform: 'translateY(-50%)', 
                                            cursor: 'pointer',
                                            color: formErrors.password ? '#dc3545' : '#90caf9',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </div>
                                </div>
                                {formErrors.password && <div style={{ color: '#dc3545', fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>{formErrors.password}</div>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '26px' }}>
                                <input type="checkbox" id="terms" style={{ accentColor: '#1565c0', marginTop: '2px', width: '14px', height: '14px', flexShrink: 0 }} />
                                <label htmlFor="terms" style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                                    By Signing In, I Agree with the{' '}
                                    <span style={{ color: '#1565c0', cursor: 'pointer', fontWeight: 600 }}>Terms &amp; Conditions</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex' }}>
                                <button type="submit" disabled={isLoading} className="btn-signin">
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}