import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import PrivateRoute from "@/components/PrivateRoute";
import { pageDefinitions } from "./workshop/pages";
import { shortcutPages } from "./site/routes";
import PublicDocumentBridge from "@/components/PublicDocumentBridge";

// Eager: tiny components on hot paths (login, simple redirects).
import Login from "@/components/Login/Login";

// Lazy: heavier feature routes get their own chunks so the initial bundle stays
// small. Each only downloads when its route is visited. These carry the big deps
// (firebase, charts, confetti, react-spring).
const LovesIngy = lazy(() => import("@/components/LovesIngy/LovesIngy"));
const WorkshopRouteBridge = lazy(
  () => import("@/components/WorkshopRouteBridge"),
);
const VisitsDenmark = lazy(
  () => import("@/components/VisitsDenmark/VisitsDenmark"),
);
const Progress = lazy(() => import("@/components/Progress/Progress"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
            <PublicDocumentBridge destination="/" />
      </ErrorBoundary>
    ),
  },
  ...["login", "Login", "LOGIN"].map((path) => ({
    path: `/${path}`,
    element: (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    ),
  })),
  {
    path: "/404",
    element: (
      <ErrorBoundary>
            <PublicDocumentBridge destination="/404.html" preserveLocation={false} />
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
  ...pageDefinitions.map((page) => ({
    path: page.path,
    element: (
      <ErrorBoundary>
        <WorkshopRouteBridge destination={page.path} />
      </ErrorBoundary>
    ),
  })),
  ...shortcutPages.map((page) => ({
    path: page.path,
    element: <PublicDocumentBridge destination={page.destination} preserveLocation={false} />,
  })),
  {
    path: "/*",
    element: <PublicDocumentBridge destination="/404.html" preserveLocation={false} />,
  },
]);

export default router;
