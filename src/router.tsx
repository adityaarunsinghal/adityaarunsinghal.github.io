import { createBrowserRouter, Navigate } from 'react-router-dom';
import PrivateApp from './PrivateApp/PrivateApp.tsx';
import { OldStaticWebsite } from './OldStaticWesbite/OldStaticWebsite.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';

export default function Router() {
  return createBrowserRouter([
    {
      path: '/',
      element: <OldStaticWebsite />,
    },
    {
      path: '/private',
      element: <PrivateApp />,
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
