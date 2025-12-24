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
import LinkedInRedirect from '@/components/LinkedInRedirect';
import InstagramRedirect from '@/components/InstagramRedirect';
import FacebookRedirect from '@/components/FacebookRedirect';
import YouTubeRedirect from '@/components/YouTubeRedirect';
import FeedbackForm from '@/components/FeedbackForm';
import VisitsDenmark from '@/components/VisitsDenmark/VisitsDenmark';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <OldStaticWebsite />
      </ErrorBoundary>
    ),
  },
  ...['login', 'Login', 'LOGIN'].map(path => ({
    path: `/${path}`,
    element: (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    ),
  })),
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
    path: "/visitsDenmark",
    element: (
      <ErrorBoundary>
        <PrivateRoute>
          <VisitsDenmark />
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
  ...['latest-resume', 'Latest-Resume', 'LATEST-RESUME'].map(path => ({
    path: `/${path}`,
    element: <ResumeRedirect />,
  })),
  ...['linkedin', 'LinkedIn', 'LINKEDIN'].map(path => ({
    path: `/${path}`,
    element: <LinkedInRedirect />,
  })),
  ...['instagram', 'Instagram', 'INSTAGRAM'].map(path => ({
    path: `/${path}`,
    element: <InstagramRedirect />,
  })),
  ...['facebook', 'Facebook', 'FACEBOOK'].map(path => ({
    path: `/${path}`,
    element: <FacebookRedirect />,
  })),
  ...['youtube', 'YouTube', 'YOUTUBE'].map(path => ({
    path: `/${path}`,
    element: <YouTubeRedirect />,
  })),
  {
    path: '/*',
    element: <Navigate to='/404' replace />,
  },
]);

export default router;