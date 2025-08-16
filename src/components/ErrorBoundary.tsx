import { Component, ErrorInfo, ReactNode } from 'react';
import fourOHfour from '../images/404.gif';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: 'max(2vw, 16px)', marginBottom: '1rem' }}>
            {this.state.error ? 'Something went wrong' : 'Sorry, that was not a real page.'}
          </h2>
          
          {this.state.error && (
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              We encountered an unexpected error. Please try again.
            </p>
          )}

          <img
            src={fourOHfour}
            alt='Error'
            style={{
              maxWidth: '75%',
              height: 'auto',
              width: '100%',
              marginBottom: '2rem'
            }}
          />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {this.state.error && (
              <button 
                onClick={this.handleRetry}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            )}
            <button 
              onClick={this.handleGoHome}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
