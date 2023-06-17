import { createBrowserRouter } from 'react-router-dom';
import App from './App.tsx';

function OldStaticWebsite() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src='/old-static/index.html'
        title='Aditya Singhal'
        style={{ width: '100%', height: '100%', border: 'none' }}
      ></iframe>
    </div>
  );
}

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
