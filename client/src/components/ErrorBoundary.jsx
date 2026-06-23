import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem 2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          margin: '2rem auto',
          maxWidth: '600px',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontWeight: '800' }}>Application Crash Detected</h2>
          <p style={{ fontWeight: '600', marginBottom: '1.5rem' }}>{this.state.error?.toString()}</p>
          <pre style={{
            textAlign: 'left',
            background: '#fff',
            padding: '1.2rem',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '0.85rem',
            border: '1px solid #fee2e2',
            color: '#374151',
            lineHeight: '1.5'
          }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }} 
            style={{
              padding: '0.75rem 1.5rem',
              background: '#991b1b',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '1.5rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(153, 27, 27, 0.2)'
            }}
          >
            Clear Cache & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
