import { Navigate, createBrowserRouter } from 'react-router-dom';
import PrivateApp from './PrivateApp/PrivateApp';
import ErrorBoundary from './ErrorBoundary';
import LovesIngy from './LovesIngy/LovesIngy';
import { OldStaticWebsite } from './OldStaticWebsite/OldStaticWebsite';

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
      path: "/lovesingy",
      element: <LovesIngy />
    },
    {
      path: "/givesingy",
      element: <Navigate to="https://forms.gle/something" />
    },
    {
      path: '/*',
      element: <Navigate to='/404' />,
    },
  ]);
}