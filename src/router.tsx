import { createBrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { OldStaticWebsite } from './old/OldStaticWebsite.tsx';

export default function Router() {
  return createBrowserRouter([
    {
      path: '/',
      element: <OldStaticWebsite />,
    },
    {
      path: '/react-app',
      element: <App />,
    },
  ]);
}
