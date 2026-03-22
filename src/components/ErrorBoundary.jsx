import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ 
                    padding: '2rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '100vh', 
                    background: 'var(--bg)',
                    fontFamily: 'sans-serif'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '2.5rem',
                        borderRadius: '1.5rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        maxWidth: '600px',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ color: 'var(--text)', marginBottom: '1rem', fontSize: '1.5rem' }}>
                            Something went wrong in this module
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            The application encountered an unexpected error while rendering this page.
                        </p>
                        
                        {this.state.error && (
                            <details style={{ 
                                textAlign: 'left', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                padding: '1rem', 
                                borderRadius: '0.5rem',
                                borderLeft: '4px solid #EF4444',
                                marginBottom: '1.5rem',
                                overflow: 'auto',
                                fontSize: '0.875rem'
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#B91C1C' }}>
                                    View Error Details
                                </summary>
                                <pre style={{ marginTop: '0.75rem', color: '#991B1B', whiteSpace: 'pre-wrap' }}>
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        <button 
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 2rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
