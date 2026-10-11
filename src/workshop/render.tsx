import { renderToStaticMarkup } from "react-dom/server";
import AgenticAIWorkshop from "../components/AgenticAIWorkshop/AgenticAIWorkshop";
import AgenticAIWorkshop2025 from "../components/AgenticAIWorkshop2025/AgenticAIWorkshop2025";
import {
  course,
  courseAction,
  historical,
  historicalRecordings,
  sessionRecordings,
  workshopPage,
  type CourseState,
  type SessionRecording,
} from "./pages";

export { course, pageDefinitions, sessionRecordings, historicalRecordings } from "./pages";

function InformationPage({
  kind,
  state,
}: {
  kind: string;
  state: CourseState;
}) {
  const action = courseAction(state);
  const feedback = kind === "feedback";
  const archived = feedback || kind === "archived-registration";
  return (
    <main className="workshop-2026 info-page" id="main-content">
      <div className="info-content">
        <a href={archived ? course.archivePath : course.path}>
          ← {archived ? "2025 workshop archive" : "2026 workshop"}
        </a>
        <h1>
          {feedback
            ? "2025 workshop feedback"
            : archived
              ? "2025 registration is closed"
              : "2026 workshop registration"}
        </h1>
        <p>
          {feedback
            ? "This form is for the October 2025 workshop."
            : archived
              ? "The October 2025 course has concluded. Visit the current workshop for the new schedule and materials."
              : action.note}
        </p>
        {!archived && (
          <p>
            {course.dates}. {course.time}. {course.venue}, {course.address}.
            Google sign-in is required for the registration form.
          </p>
        )}
        <a
          className="course-button"
          href={
            feedback
              ? historical.feedback
              : archived
                ? course.path
                : action.href
          }
        >
          {feedback
            ? "Open the 2025 feedback form"
            : archived
              ? "Visit the 2026 workshop"
              : action.label}{" "}
          <span aria-hidden="true">↗</span>
        </a>
        {kind === "archived-registration" && (
          <p>
            <a href={historical.registration}>
              Historical 2025 registration form
            </a>
          </p>
        )}
        <p>
          <a href={`mailto:${course.contact}`}>
            Contact the workshop organizer
          </a>
        </p>
      </div>
    </main>
  );
}

// Shared by production generation and Vite development. No browser-only imports or auth.
export function renderWorkshop(
  pathname: string,
  stylesheet: string,
  state: CourseState = course.state,
  recordings: SessionRecording[] = sessionRecordings,
) {
  const page = workshopPage(pathname);
  if (!page) return null;
  const pageRecordings = page.kind === "archive" ? historicalRecordings : recordings;
  const year =
    page.kind === "archive" ||
    page.kind === "feedback" ||
    page.kind === "archived-registration"
      ? 2025
      : 2026;
  const canonical = `https://adityasinghal.com${page.canonical}`;
  const image = `https://adityasinghal.com/workshops/workshop-social-${year}.png`;
  return (
    "<!DOCTYPE html>\n" +
    renderToStaticMarkup(
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{page.title}</title>
          <meta name="description" content={page.description} />
          {page.kind === "current" && (
            <>
              <script src="/workshops/download-slides.js" defer />
              <script src="/workshops/instructor-portraits-2026-10-09.js" defer />
            </>
          )}
          {(page.kind === "current" || page.kind === "archive") &&
            pageRecordings.some((recording) => recording.youtubeId) && (
              <script src="/workshops/session-recordings.js" defer />
            )}
          <link rel="canonical" href={canonical} />
          <link
            rel="icon"
            type="image/svg+xml"
            sizes="any"
            href="/workshops/workshop-favicon.svg"
          />
          <meta
            name="robots"
            content={
              page.kind === "current" || page.kind === "archive"
                ? "index, follow"
                : "noindex, follow"
            }
          />
          <meta name="theme-color" content="#111827" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={page.title} />
          <meta property="og:description" content={page.description} />
          <meta property="og:url" content={canonical} />
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta
            property="og:image:alt"
            content={`NYU CDS Agentic AI Workshop ${year}`}
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={page.title} />
          <meta name="twitter:description" content={page.description} />
          <meta name="twitter:image" content={image} />
          <link rel="stylesheet" href={stylesheet} />
        </head>
        <body className="workshop-document">
          <a className="workshop-skip-link" href="#main-content">
            Skip to content
          </a>
          {page.kind === "current" ? (
            <AgenticAIWorkshop state={state} recordings={recordings} />
          ) : page.kind === "archive" ? (
            <AgenticAIWorkshop2025 recordings={pageRecordings} />
          ) : (
            <InformationPage kind={page.kind} state={state} />
          )}
        </body>
      </html>,
    )
  );
}
