import { Component, ErrorInfo, ReactNode } from 'react';
import fourOHfour from '../images/404.gif';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <h2 style={{ fontSize: 'max(2vw, 16px)' }}>
          Sorry, that was not a real page.
        </h2>
        <img
          src={fourOHfour}
          alt='Sorry 404!'
          style={{
            maxWidth: '75%',
            height: 'auto',
            width: '100%',
          }}
        />
      </div>
    );
  }
}

export default ErrorBoundary;
