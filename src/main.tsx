import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import router from './router';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      {/* Single Suspense boundary above the router so lazily-loaded route
          chunks (see router.tsx) show a fallback while they download. */}
      <Suspense fallback={<Loading message="Loading..." />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
