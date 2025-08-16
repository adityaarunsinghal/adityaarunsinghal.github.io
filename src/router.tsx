import { Navigate, createBrowserRouter } from 'react-router-dom';
import PrivateApp from '@/components/PrivateApp/PrivateApp';
import ErrorBoundary from '@/components/ErrorBoundary';
import NotFound from '@/components/NotFound';
import LovesIngy from '@/components/LovesIngy/LovesIngy';
import { OldStaticWebsite } from '@/components/OldStaticWebsite/OldStaticWebsite';
import PrivateRoute from '@/components/PrivateRoute';
import Login from '@/components/Login/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <OldStaticWebsite />
      </ErrorBoundary>
    ),
  },
  {
    path: '/login',
    element: (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    ),
  },
  {
    path: '/private',
    element: (
      <ErrorBoundary>
        <PrivateApp />
      </ErrorBoundary>
    ),
  },
  {
    path: '/404',
    element: (
      <ErrorBoundary>
        <NotFound />
      </ErrorBoundary>
    ),
  },
  {
    path: "/lovesingy",
    element: (
      <ErrorBoundary>
        <PrivateRoute>
          <LovesIngy />
        </PrivateRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: '/*',
    element: <Navigate to='/404' replace />,
  },
]);

export default router;