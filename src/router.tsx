import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import PrivateRoute from '@/components/PrivateRoute';

// Eager: tiny components on hot paths (login, simple redirects).
import Login from '@/components/Login/Login';
import ResumeRedirect from '@/components/ResumeRedirect';
import LinkedInRedirect from '@/components/LinkedInRedirect';
import InstagramRedirect from '@/components/InstagramRedirect';
import FacebookRedirect from '@/components/FacebookRedirect';
import YouTubeRedirect from '@/components/YouTubeRedirect';
import GitHubRedirect from '@/components/GitHubRedirect';
import WifeRedirect from '@/components/WifeRedirect';

// Lazy: heavier feature routes get their own chunks so the initial bundle stays
// small. Each only downloads when its route is visited. These carry the big deps
// (firebase, charts, confetti, react-spring, jQuery landing page).
const OldStaticWebsite = lazy(() =>
  import('@/components/OldStaticWebsite/OldStaticWebsite').then(m => ({ default: m.OldStaticWebsite }))
);
const LovesIngy = lazy(() => import('@/components/LovesIngy/LovesIngy'));
const AgenticAIWorkshop = lazy(() => import('@/components/AgenticAIWorkshop/AgenticAIWorkshop'));
const RegistrationForm = lazy(() => import('@/components/RegistrationForm'));
const FeedbackForm = lazy(() => import('@/components/FeedbackForm'));
const VisitsDenmark = lazy(() => import('@/components/VisitsDenmark/VisitsDenmark'));
const Progress = lazy(() => import('@/components/Progress/Progress'));
// Lazy so the 1.1MB animated 404 asset never loads as part of the initial bundle.
const NotFound = lazy(() => import('@/components/NotFound'));

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
    path: "/progress",
    element: (
      <ErrorBoundary>
        <PrivateRoute>
          <Progress />
        </PrivateRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: "/translate",
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
  ...['github', 'GitHub', 'GITHUB', 'Github'].map(path => ({
    path: `/${path}`,
    element: <GitHubRedirect />,
  })),
  ...['wife', 'Wife', 'WIFE'].map(path => ({
    path: `/${path}`,
    element: <WifeRedirect />,
  })),
  {
    path: '/*',
    element: <Navigate to='/404' replace />,
  },
]);

export default router;