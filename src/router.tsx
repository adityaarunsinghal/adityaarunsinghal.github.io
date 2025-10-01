import { Navigate, createBrowserRouter } from 'react-router-dom';
import PrivateApp from '@/components/PrivateApp/PrivateApp';
import ErrorBoundary from '@/components/ErrorBoundary';
import NotFound from '@/components/NotFound';
import LovesIngy from '@/components/LovesIngy/LovesIngy';
import AgenticAIWorkshop from '@/components/AgenticAIWorkshop/AgenticAIWorkshop';
import RegistrationForm from '@/components/RegistrationForm';
import { OldStaticWebsite } from '@/components/OldStaticWebsite/OldStaticWebsite';
import PrivateRoute from '@/components/PrivateRoute';
import Login from '@/components/Login/Login';
import ResumeRedirect from '@/components/ResumeRedirect';
import FeedbackForm from '@/components/FeedbackForm';

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
    path: '/agentic-ai-workshop',
    element: (
      <ErrorBoundary>
        <AgenticAIWorkshop />
      </ErrorBoundary>
    ),
  },
  {
    path: '/agentic-ai-workshop/registration-form',
    element: (
      <ErrorBoundary>
        <RegistrationForm />
      </ErrorBoundary>
    ),
  },
  {
    path: '/agentic-ai-workshop/feedback',
    element: (
      <ErrorBoundary>
        <FeedbackForm />
      </ErrorBoundary>
    ),
  },
  {
    path: '/registration-form',
    element: (
      <ErrorBoundary>
        <RegistrationForm />
      </ErrorBoundary>
    ),
  },
  {
    path: '/latest-resume',
    element: <ResumeRedirect />,
  },
  {
    path: '/*',
    element: <Navigate to='/404' replace />,
  },
]);

export default router;