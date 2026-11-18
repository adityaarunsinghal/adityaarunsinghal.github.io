import { course, historical, instructors, pageDefinitions, sessions } from "./pages";
import { personalOrigin, personalWorkshopPublication, workshopCanonicalUrl, type WorkshopPublication } from "./publication";

/** Structured data describes the course content shown by the public page. */
export function workshopSchema(pathname: string, publication: WorkshopPublication = personalWorkshopPublication(), servedPath = pathname) {
  const page = pageDefinitions.find((entry) => entry.path === pathname);
  if (!page || (page.kind !== "current" && page.kind !== "archive")) return null;
  const current = page.kind === "current";
  const url = workshopCanonicalUrl(servedPath, publication)!;
  const courseId = `${url}#course`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: page.title,
        description: page.description,
        dateModified: current ? course.modified : historical.modified,
        isPartOf: { "@id": `${publication.canonicalOrigin}/#website` },
        mainEntity: { "@id": courseId },
      },
      {
        "@type": "Course",
        "@id": courseId,
        url,
        name: current ? "NYU Agentic AI Workshop 2026" : "NYU Agentic AI Workshop 2025",
        description: page.description,
        provider: { "@type": "Organization", name: "NYU Center for Data Science" },
        hasCourseInstance: {
          "@type": "CourseInstance",
          "@id": `${url}#course-instance`,
          name: current ? "Fall 2026 workshop" : "Fall 2025 workshop",
          courseMode: "onsite",
          startDate: current ? sessions[0].date : "2025-10-01",
          endDate: current ? sessions[sessions.length - 1].date : "2025-10-22",
          ...(current ? {
            location: {
              "@type": "Place",
              name: course.venue,
              address: { "@type": "PostalAddress", streetAddress: course.address },
            },
          } : {}),
          instructor: instructors.map((instructor) => ({
            "@type": "Person",
            ...(instructor.id === "adi" ? { "@id": `${personalOrigin}/#person` } : {}),
            name: instructor.name,
            sameAs: instructor.linkedin,
          })),
        },
      },
    ],
  };
}
