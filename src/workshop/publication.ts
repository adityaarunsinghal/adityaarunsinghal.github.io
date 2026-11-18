import { course, pageDefinitions } from "./pages";

export const personalOrigin = "https://adityasinghal.com";
export const learningOrigin = "https://learningwithagents.com";

export type WorkshopPublication = {
  role: "personal" | "learning";
  origin: string;
  canonicalOrigin: string;
  assistant?: { scriptUrl: string; websiteId: string };
};

export const learningWorkshopPublication: WorkshopPublication = {
  role: "learning",
  origin: learningOrigin,
  canonicalOrigin: learningOrigin,
};

/** Flip only after the dedicated host has passed its live HTTPS checks. */
export function personalWorkshopPublication(canonicalOrigin = personalOrigin): WorkshopPublication {
  if (![personalOrigin, learningOrigin].includes(canonicalOrigin)) {
    throw new Error(`Unsupported workshop canonical origin: ${canonicalOrigin}`);
  }
  return { role: "personal", origin: personalOrigin, canonicalOrigin };
}

export function workshopEditionPath(year: number, publication: WorkshopPublication) {
  if (year !== 2025 && year !== 2026) throw new Error(`Unknown workshop year: ${year}`);
  return publication.role === "learning" ? `/${year}/`
    : year === 2026 ? course.path : course.archivePath;
}

export function workshopCanonicalPath(pathname: string, publication: WorkshopPublication) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const learning = publication.canonicalOrigin === learningOrigin;
  const page = workshopPages(publication).find((entry) => entry.path === path);
  if (!page) return null;
  if (!learning) return page.sourceCanonical;
  const year = ["archive", "feedback", "archived-registration"].includes(page.kind) ? 2025 : 2026;
  const suffix = page.kind === "feedback" ? "feedback/"
    : ["registration", "archived-registration"].includes(page.kind) ? "registration-form/" : "";
  return `/${year}/${suffix}`;
}

export function workshopCanonicalUrl(pathname: string, publication = personalWorkshopPublication()) {
  const path = workshopCanonicalPath(pathname, publication);
  return path ? `${publication.canonicalOrigin}${path}` : null;
}

export function workshopMarkdownPath(pathname: string) {
  return pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}.md`;
}

export function workshopPages(publication: WorkshopPublication) {
  const original = pageDefinitions.map((page) => ({
    ...page, path: String(page.path), sourcePath: String(page.path), sourceCanonical: String(page.canonical),
  }));
  if (publication.role === "personal") return original;
  const aliases = [
    ["/", course.path], ["/2026/", course.path], ["/2025/", course.archivePath],
    ["/2026/registration-form/", "/agentic-ai-workshop/registration-form/"],
    ["/2025/registration-form/", "/agentic-ai-workshop-2025/registration-form/"],
    ["/2025/feedback/", "/agentic-ai-workshop-2025/feedback/"],
    ["/agentic-ai-workshop-2026/registration-form/", "/agentic-ai-workshop/registration-form/"],
  ];
  return [
    ...original,
    ...aliases.map(([path, sourcePath]) => ({ ...original.find((page) => page.path === sourcePath)!, path })),
  ];
}
