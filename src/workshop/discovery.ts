import { course, historical, historicalRecordings, pageDefinitions, resources as workshopResources, sessionRecordings, sessions, type SessionRecording } from "./pages";
import { learningWorkshopPublication, personalOrigin, workshopCanonicalUrl, workshopEditionPath, type WorkshopPublication } from "./publication";

function publishedRecordings(recordings: SessionRecording[]) {
  return recordings.filter((recording) => recording.youtubeId !== null).map((recording) => {
    const url = `https://www.youtube.com/watch?v=${recording.youtubeId}`;
    return {
      id: recording.id,
      session: recording.session,
      date: recording.date,
      title: recording.title,
      url,
      durationSeconds: recording.durationSeconds,
      chapters: recording.chapters.map((chapter) => ({
        title: chapter.title,
        startSeconds: chapter.startSeconds,
        url: `${url}&t=${chapter.startSeconds}s`,
      })),
    };
  });
}

const currentPage = pageDefinitions.find((page) => page.kind === "current")!;
const archivePage = pageDefinitions.find((page) => page.kind === "archive")!;

export function workshopData(publication: WorkshopPublication = learningWorkshopPublication) {
return {
  apiVersion: "1",
  sourceUrl: workshopCanonicalUrl(course.path, publication)!,
  modified: course.modified >= historical.modified ? course.modified : historical.modified,
  workshops: [
    {
      year: course.year,
      status: course.state,
      title: currentPage.title,
      url: workshopCanonicalUrl(currentPage.path, publication)!,
      description: currentPage.description,
      modified: course.modified,
      repositoryUrl: course.publicRepositoryUrl,
      schedule: {
        dates: course.dates,
        time: course.time,
        timeZone: "America/New_York",
        venue: course.venue,
        address: course.address,
      },
      sessions: sessions.map((session) => ({
        date: session.date,
        title: session.title,
        description: session.description,
        topics: [...session.topics],
        attendance: session.attendance,
      })),
      materials: workshopResources.map((resource) => ({
        name: resource.name,
        description: resource.description,
        access: resource.links.some((link) => link.url === course.appStoreUrl)
          ? "registered-students" : "public",
        links: resource.links
          .filter((link) => link.url !== null)
          .map((link) => ({
            url: link.url!,
            ...(link.action ? { label: link.action } : {}),
            ...(link.download ? { download: link.download } : {}),
          })),
        ...(resource.note ? { note: resource.note } : {}),
      })).filter((resource) => resource.links.length > 0),
      recordings: publishedRecordings(sessionRecordings),
    },
    {
      year: 2025,
      status: "archived",
      title: archivePage.title,
      url: workshopCanonicalUrl(archivePage.path, publication)!,
      description: archivePage.description,
      modified: historical.modified,
      repositoryUrl: historical.repository,
      materials: [
        {
          name: "2025 public repository",
          description: "Public code and materials from the archived workshop.",
          access: "public",
          links: [{ url: historical.repository, label: "Open the repository" }],
        },
        {
          name: "2025 recording playlist",
          description: "The archived workshop's public video playlist.",
          access: "public",
          links: [{ url: historical.playlist, label: "Open the playlist" }],
        },
        ...historical.clips.map((clip) => ({
          name: clip.title,
          description: clip.description,
          access: "public",
          links: [{ url: clip.url, label: "Watch the clip" }],
        })),
      ],
      recordings: publishedRecordings(historicalRecordings),
    },
  ],
};

}

/** Machine documents for this host contain only workshop resources. */
export function workshopMachineDocuments(publication = learningWorkshopPublication): Record<string, string> {
  const origin = publication.origin;
  const current = workshopEditionPath(2026, publication);
  const archive = workshopEditionPath(2025, publication);
  const data = workshopData(publication);
  const endpoints = [
    { path: "/api/v1/index.json", operationId: "getApiIndex", summary: "Discover workshop data" },
    { path: "/api/v1/workshops.json", operationId: "listWorkshops", summary: "Read both workshop editions and their published resources" },
  ];
  const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
  const readingMap = `# Learning with Agents

> NYU Agentic AI workshop materials taught by Adi Singhal and Luca Chang.

- [2026 workshop](${origin}${current}): Current edition with curriculum, recordings, chapters, slides and starter code.
- [2026 Markdown](${origin}/2026.md): The same published course in text.
- [2025 archive](${origin}${archive}): Historical course and recordings.
- [2025 Markdown](${origin}/2025.md): The same archive in text.
- [Workshop data](${origin}/api/v1/workshops.json): Structured information for both years.
- [API specification](${origin}/openapi.json): Available read-only GET endpoints.
- [Agent guidance](${origin}/agents.md): Reading and citation instructions.
- [Access](${origin}/auth.md): Public access and failure handling.
- [Privacy](${personalOrigin}/privacy/): Shared privacy information.
`;
  const guidance = `# Reading Learning with Agents

Use this site for the published NYU Agentic AI workshop curriculum, released materials and recordings. Keep 2025 and 2026 separate. Use each edition's canonical URL when citing it; course dates describe sessions, while modified dates describe content updates.

Read [the workshop JSON](${origin}/api/v1/workshops.json), [the API index](${origin}/api/v1/index.json), or [the reading map](${origin}/llms.txt). All support ordinary HTTPS GET without credentials. These static documents cannot register attendees or send messages. Follow external resources' own access requirements; the class app store is for registered students.

If WebMCP is available, course pages offer get_public_workshops with optional year 2025 or 2026. It reads the same public JSON and performs no writes. Use HTTPS GET otherwise. An unavailable material has no destination; do not invent one.

Shared [developer information](${personalOrigin}/developers/) and [privacy information](${personalOrigin}/privacy/) are hosted on Adi's personal site.
`;
  const access = `# Public workshop access

No login, API key, token or payment is required to read this site's HTML, Markdown or JSON. GET ${origin}/api/v1/workshops.json returns the published course information. The API is read-only and does not accept registration or messages.

Check HTTP status and Content-Type before parsing JSON. Unknown paths return a genuine HTML 404. Retry temporary failures only with a small bounded budget and respect Retry-After when supplied. External links may have their own access requirements.
`;
  const openapi = {
    openapi: "3.1.1",
    info: { title: "Learning with Agents workshop API", version: "1.0.0", description: "Read-only public course information. No credentials required." },
    servers: [{ url: origin }],
    security: [],
    paths: Object.fromEntries(endpoints.map((endpoint) => [endpoint.path, {
      get: {
        operationId: endpoint.operationId, summary: endpoint.summary,
        responses: {
          "200": { description: "Published JSON document", content: {
            "application/json": { schema: { type: "object", required: ["apiVersion", "sourceUrl", "modified"], properties: {
              apiVersion: { const: "1" }, sourceUrl: { type: "string", format: "uri" }, modified: { type: "string", format: "date" },
              ...(endpoint.path.endsWith("workshops.json") ? { workshops: { type: "array", items: { type: "object", required: ["year", "url", "recordings"], properties: {
                year: { type: "integer", enum: [2025, 2026] }, url: { type: "string", format: "uri" }, recordings: { type: "array", items: { type: "object" } },
              } } } } : { endpoints: { type: "array", items: { type: "object" } } }),
            } } },
          } },
        },
      },
    }])),
  };
  return {
    "/api/v1/workshops.json": json(data),
    "/api/v1/index.json": json({
      apiVersion: "1", sourceUrl: `${origin}/`, modified: data.modified,
      name: "Learning with Agents workshop API", readOnly: true, authentication: "none",
      documentationUrl: `${origin}/agents.md`, openApiUrl: `${origin}/openapi.json`,
      endpoints: endpoints.map((endpoint) => ({ ...endpoint, url: `${origin}${endpoint.path}`, method: "GET" })),
    }),
    "/openapi.json": json(openapi),
    "/llms.txt": readingMap,
    "/2026/llms.txt": `# 2026 workshop\n\n${readingMap}`,
    "/2025/llms.txt": `# 2025 archive\n\n${readingMap}`,
    "/agents.md": guidance,
    "/auth.md": access,
    "/robots.txt": `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
    "/sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}${current}</loc><lastmod>${course.modified}</lastmod></url><url><loc>${origin}${archive}</loc><lastmod>${historical.modified}</lastmod></url></urlset>\n`,
  };
}
