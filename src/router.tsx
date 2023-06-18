import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { OldStaticWebsite } from './OldStaticWebsite.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';

export default function Router() {
  return createBrowserRouter([
    {
      path: '/',
      element: <OldStaticWebsite />,
      errorElement: <ErrorBoundary />,
    },
    {
      path: '/react-app',
      element: <App />,
      errorElement: <ErrorBoundary />,
    },
    {
      path: '/404',
      element: <ErrorBoundary />,
    },
    {
      path: '/*',
      element: <Navigate to='/404' />,
    },
  ]);
}
