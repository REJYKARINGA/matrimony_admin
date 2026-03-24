import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaSyncAlt, FaHome, FaCopy } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, copied: false };
    }

    componentDidMount() {
        console.log("ErrorBoundary is now active and monitoring for crashes.");
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    handleCopyError = () => {
        const errorDetails = `
Error: ${this.state.error?.toString()}
Location: ${this.getComponentName()}
Component Stack: ${this.state.errorInfo?.componentStack}
        `.trim();

        navigator.clipboard.writeText(errorDetails).then(() => {
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        });
    };

    getComponentName = () => {
        const stack = this.state.errorInfo?.componentStack || '';
        const match = stack.match(/in\s+([A-Z][a-zA-Z0-9]*)/);
        return match ? `${match[1]}.jsx` : 'Unknown Component';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    padding: '2rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            maxWidth: '600px',
                            width: '100%',
                            background: 'white',
                            borderRadius: '24px',
                            padding: '3rem',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#FEE2E2',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem',
                            color: '#EF4444'
                        }}>
                            <FaExclamationTriangle size={40} />
                        </div>

                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#1e293b',
                            marginBottom: '1rem'
                        }}>
                            Oops! Something went wrong.
                        </h1>

                        <p style={{
                            color: '#64748b',
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            marginBottom: '1rem'
                        }}>
                            The application encountered an unexpected error. Don't worry, we're on it! You can try refreshing the page or going back to the dashboard.
                        </p>

                        <div style={{
                            fontSize: '1rem',
                            color: '#ef4444',
                            fontWeight: '600',
                            marginBottom: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ opacity: 0.7 }}>Happening in:</span> 
                            <span>{this.getComponentName()}</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={this.handleReload}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1.5rem',
                                    background: '#1565c0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <FaSyncAlt />
                                Reload Page
                            </button>



                            <button
                                onClick={this.handleGoHome}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1.5rem',
                                    background: 'white',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <FaHome />
                                Go to Dashboard
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div style={{
                                marginTop: '3rem',
                                textAlign: 'left',
                                background: '#f1f5f9',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                overflow: 'auto',
                                maxHeight: '200px',
                                fontSize: '0.875rem',
                                position: 'relative',
                                border: '1px solid #e2e8f0'
                            }}>
                                <button
                                    onClick={this.handleCopyError}
                                    title="Copy Error Details"
                                    style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: this.state.copied ? '#10b981' : 'white',
                                        color: this.state.copied ? 'white' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '0.4rem 0.6rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        zIndex: 10
                                    }}
                                >
                                    <FaCopy size={12} />
                                    {this.state.copied ? 'Copied!' : 'Copy'}
                                </button>

                                <strong style={{ color: '#ef4444', display: 'block', marginBottom: '0.5rem' }}>Error Details:</strong>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#334155' }}>
                                    {this.state.error?.toString()}
                                </pre>
                            </div>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
