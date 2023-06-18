import { Component, ErrorInfo, ReactNode } from 'react';
import fourOHfour from './images/404.gif';

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

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    return (
      <>
        <h3>Sorry... there's no page like that. Where are you trying to go?</h3>
        <img
          src={fourOHfour}
          alt='Sorry 404!'
        />
      </>
    );
  }
}

export default ErrorBoundary;
