import { Navigate, createBrowserRouter } from 'react-router-dom';
import PrivateApp from './components/PrivateApp/PrivateApp';
import ErrorBoundary from './components/ErrorBoundary';
import LovesIngy from './components/LovesIngy/LovesIngy';
import { OldStaticWebsite } from './components/OldStaticWebsite/OldStaticWebsite';
import PrivateRoute from './components/PrivateRoute';
import RedirectToExternal from './components/RedirectToExternal';
import Login from './components/Login/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <OldStaticWebsite />,
  },
  {
    path: '/login',
    element: <Login />,
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
    element: (
      <PrivateRoute>
        <LovesIngy />
      </PrivateRoute>
    ),
  },
  {
    path: "/givesingy",
    element: (
      // <PrivateRoute>
      <RedirectToExternal url="https://docs.google.com/forms/d/e/1FAIpQLSfLkz4REqAGwsaLP-vAuUtXJLT2V8aEUEN5ulT4huW7ylkGxw/viewform" />
      // </PrivateRoute>
    ),
  },
  {
    path: '/*',
    element: <Navigate to='/404' />,
  },
]);

export default router;