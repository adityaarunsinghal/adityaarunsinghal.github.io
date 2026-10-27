import { profileLinks, readingMap, site } from "./content";
import {
  course,
  historical,
  historicalRecordings,
  pageDefinitions,
  resources as workshopResources,
  sessionRecordings,
  sessions,
  type SessionRecording,
} from "../workshop/pages";

const apiVersion = "1";
const documentationUrl = `${site.origin}/developers/`;
const openApiUrl = `${site.origin}/openapi.json`;

export const apiEndpoints = [
  {
    path: "/api/v1/index.json",
    operationId: "getApiIndex",
    summary: "Read the public API index",
    description: "Discover the available public JSON documents and their documentation.",
  },
  {
    path: "/api/v1/profile.json",
    operationId: "getProfile",
    summary: "Read Aditya Singhal's public profile",
    description: "Read the biography, professional interests and profile links published on the personal website.",
  },
  {
    path: "/api/v1/resources.json",
    operationId: "listResources",
    summary: "List public projects, writing and teaching resources",
    description: "Read the site's public reading map. Filter its small resource list in your client.",
  },
  {
    path: "/api/v1/workshops.json",
    operationId: "listWorkshops",
    summary: "Read current and archived workshop resources",
    description: "Read the published course information, material links and available recording chapters for the 2026 and 2025 workshops.",
  },
] as const;

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

const profileDocument = {
  apiVersion,
  sourceUrl: `${site.origin}/`,
  modified: site.modified,
  name: site.name,
  alternateName: site.alternateName,
  description: site.description,
  biography: site.biography,
  jobTitle: site.jobTitle,
  employer: site.employer,
  topics: ["Agentic AI", "Model Context Protocol (MCP)", "RAG systems", "LLM evaluation"],
  profiles: { ...profileLinks },
};

const resourcesDocument = {
  apiVersion,
  sourceUrl: `${site.origin}/`,
  modified: site.modified,
  resources: readingMap.flatMap((group) => group.links.map((link) => ({
    category: group.heading,
    name: link.name,
    url: link.url,
    description: link.description,
  }))),
};

const workshopsDocument = {
  apiVersion,
  sourceUrl: `${site.origin}${course.path}`,
  modified: course.modified >= historical.modified ? course.modified : historical.modified,
  workshops: [
    {
      year: course.year,
      status: course.state,
      title: currentPage.title,
      url: `${site.origin}${currentPage.canonical}`,
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
      url: `${site.origin}${archivePage.canonical}`,
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

export const apiDocuments: Record<string, unknown> = {
  "/api/v1/index.json": {
    apiVersion,
    sourceUrl: documentationUrl,
    modified: site.modified,
    name: "Aditya Singhal public data API",
    description: "Read-only JSON documents generated from the public personal website and workshop materials. No account or API key is required.",
    readOnly: true,
    authentication: "none",
    documentationUrl,
    openApiUrl,
    endpoints: apiEndpoints.map((endpoint) => ({
      ...endpoint,
      url: `${site.origin}${endpoint.path}`,
      method: "GET",
    })),
  },
  "/api/v1/profile.json": profileDocument,
  "/api/v1/resources.json": resourcesDocument,
  "/api/v1/workshops.json": workshopsDocument,
};

type Schema = Record<string, unknown>;
const text = (description: string): Schema => ({ type: "string", description });
const uri = (description: string): Schema => ({ ...text(description), format: "uri" });
const date = (description: string): Schema => ({ ...text(description), format: "date" });
const reference = (name: string): Schema => ({ $ref: `#/components/schemas/${name}` });
const list = (items: Schema, description: string): Schema => ({
  type: "array",
  description,
  items,
});
const object = (
  description: string,
  properties: Record<string, Schema>,
  required = Object.keys(properties),
): Schema => ({
  type: "object",
  description,
  additionalProperties: true,
  properties,
  required,
});
const envelope = {
  apiVersion: { ...text("Version of this public data contract."), const: apiVersion },
  sourceUrl: uri("Canonical public HTML source for this document."),
  modified: date("Date of the last deliberate update to the source content or its public metadata."),
};

const schemas: Record<string, Schema> = {
  Endpoint: object("One available public JSON document.", {
    path: text("Exact same-origin path, including the .json suffix."),
    url: uri("Absolute URL of the JSON document."),
    method: { ...text("HTTP method used to retrieve the document."), const: "GET" },
    operationId: text("Unique operation identifier from the OpenAPI document."),
    summary: text("Short explanation of the document."),
    description: text("What the document contains and how it can be used."),
  }),
  ApiIndex: object("Index of the static public data API.", {
    ...envelope,
    name: text("Public name of this data interface."),
    description: text("Purpose and access requirements of this interface."),
    readOnly: { type: "boolean", const: true, description: "All listed operations retrieve public information." },
    authentication: { ...text("No credentials are needed to read these documents."), const: "none" },
    documentationUrl: uri("Human-readable API documentation."),
    openApiUrl: uri("Machine-readable OpenAPI contract."),
    endpoints: list(reference("Endpoint"), "The complete list of available JSON documents."),
  }),
  Profile: object("Identity and professional biography published by Aditya Singhal.", {
    ...envelope,
    name: text("Full public name."),
    alternateName: text("Publicly used alternate name."),
    description: text("Concise public profile description."),
    biography: text("Biography from the homepage."),
    jobTitle: text("Current professional title as stated on the website."),
    employer: text("Employer named in the public biography."),
    topics: list(text("A topic covered by the public biography and work."), "Professional interests described on the site."),
    profiles: object(
      "Official public profile destinations linked by the website.",
      Object.fromEntries(Object.keys(profileLinks).map((name) => [
        name, uri(`Public ${name} profile linked from the website.`),
      ])),
    ),
  }),
  Resource: object("A public destination from the site's reading map.", {
    category: text("Reading-map section containing this resource."),
    name: text("Published resource name."),
    url: uri("Canonical destination of the resource; may be an external website."),
    description: text("Published description of the resource."),
  }),
  Resources: object("The site's public reading map.", {
    ...envelope,
    resources: list(reference("Resource"), "All published reading-map destinations. Filter locally by category, name or description."),
  }),
  MaterialLink: object("A released workshop material destination.", {
    url: uri("Published URL. The destination controls its own access requirements."),
    label: text("Action label shown on the workshop page."),
    download: text("Suggested filename for an available download."),
  }, ["url"]),
  Material: {
    ...object("A group of published workshop material links, with their access requirements.", {
      name: text("Published material name."),
      description: text("Description of the material."),
      access: {
        ...text("Whether the linked material is public or reserved for registered students."),
        enum: ["public", "registered-students"],
      },
      links: { ...list(reference("MaterialLink"), "Published destinations; unreleased links are omitted."), minItems: 1 },
      note: text("Published qualification, including any restriction to registered students."),
    }, ["name", "description", "access", "links"]),
    allOf: [{
      if: { properties: { access: { const: "registered-students" } }, required: ["access"] },
      then: {
        properties: { note: { ...text("Published restriction on access to this material."), minLength: 1 } },
        required: ["note"],
      },
    }],
  },
  Chapter: object("One chapter in an available workshop recording.", {
    title: text("Chapter title from the published recording index."),
    startSeconds: { type: "number", minimum: 0, description: "Chapter start measured in seconds from the beginning of the recording." },
    url: uri("Public recording URL with this chapter's start time."),
  }),
  Recording: object("An available public workshop recording.", {
    id: text("Recording identifier within its workshop year."),
    session: { type: "integer", minimum: 1, description: "Session number within the workshop." },
    date: date("Date of the workshop session."),
    title: text("Published recording title."),
    url: uri("Public YouTube watch URL."),
    durationSeconds: { type: "number", exclusiveMinimum: 0, description: "Duration of the source recording in seconds." },
    chapters: list(reference("Chapter"), "Published chapters in chronological order."),
  }),
  Schedule: object("Published current-workshop schedule and venue.", {
    dates: text("Human-readable workshop dates."),
    time: text("Human-readable recurring session time."),
    timeZone: text("IANA time-zone name for the session times."),
    venue: text("Published meeting location."),
    address: text("Public course venue address; not a personal or business address for Aditya Singhal."),
  }),
  Session: object("A session from the published current-workshop schedule.", {
    date: date("Scheduled date of the session."),
    title: text("Published session title."),
    description: text("What the session covers."),
    topics: list(text("One scheduled topic."), "Published session topics."),
    attendance: text("Published attendance guidance."),
  }),
  Workshop: object("One current or archived workshop, with published resources and access notes.", {
    year: { type: "integer", enum: [2025, course.year], description: "Calendar year of this workshop edition." },
    status: {
      ...text("Editorial course state. It is updated deliberately rather than inferred from a visitor's clock."),
      enum: ["registration-open", "registration-closed", "in-progress", "complete", "archived"],
    },
    title: text("Title of the canonical workshop page."),
    url: uri("Canonical public HTML page for this workshop."),
    description: text("Description of this workshop edition."),
    modified: date("Date of the last deliberate update to this workshop's content or public metadata."),
    repositoryUrl: uri("Official public course repository."),
    schedule: reference("Schedule"),
    sessions: list(reference("Session"), "Current-course sessions when a structured schedule is available."),
    materials: list(reference("Material"), "Published material groups with at least one available link."),
    recordings: list(reference("Recording"), "Only recordings with published video destinations."),
  }, ["year", "status", "title", "url", "description", "modified", "repositoryUrl", "materials", "recordings"]),
  Workshops: object("Current and archived public workshop information.", {
    ...envelope,
    workshops: list(reference("Workshop"), "Workshop editions. Filter locally by numeric year."),
  }),
};

const endpointSchemas: Record<(typeof apiEndpoints)[number]["path"], string> = {
  "/api/v1/index.json": "ApiIndex",
  "/api/v1/profile.json": "Profile",
  "/api/v1/resources.json": "Resources",
  "/api/v1/workshops.json": "Workshops",
};

export function openApiDocument() {
  return {
    openapi: "3.1.1",
    info: {
      title: "Aditya Singhal public data API",
      version: "1.0.0",
      description: [
        "Read-only public JSON documents generated from Aditya Singhal's personal website and workshop materials.",
        "No account, API key, authentication flow or payment is required. This is a static information interface, not a model-inference or transactional service.",
        "Use the exact GET paths below. HEAD requests can inspect the host's response headers without a response body. Query parameters do not filter or change the documents; filter the returned arrays in your client.",
        "Version 1 may gain additional public fields. Clients should tolerate unknown fields; existing documented field meanings and types remain stable within this version.",
        "Respect the live Cache-Control and conditional-request headers supplied by GitHub Pages. Data changes with site releases; there is no published application rate limit, freshness guarantee or service-level agreement.",
        "Check the HTTP status and Content-Type before parsing JSON. Missing paths and host errors may return HTML. A generic JSON error envelope is not provided.",
        "Links to other websites retain those websites' own availability and access requirements. The public data interface does not provide access to private site applications.",
      ].join("\n\n"),
      contact: { name: site.name, url: `${site.origin}/#contact` },
    },
    servers: [{ url: site.origin, description: "Public website hosted on GitHub Pages." }],
    externalDocs: { description: "Public data documentation and usage examples.", url: documentationUrl },
    security: [],
    tags: [{ name: "Public information", description: "Read the public biography, resources and teaching materials." }],
    paths: Object.fromEntries(apiEndpoints.map((endpoint) => [
      endpoint.path,
      {
        get: {
          operationId: endpoint.operationId,
          summary: endpoint.summary,
          description: endpoint.description,
          tags: ["Public information"],
          security: [],
          responses: {
            "200": {
              description: "The requested public JSON document.",
              content: {
                "application/json": {
                  schema: reference(endpointSchemas[endpoint.path]),
                  example: apiDocuments[endpoint.path],
                },
              },
            },
            "304": {
              description: "Not modified in response to a conditional request. This response has no body; retain the previously cached document.",
            },
            default: {
              description: "A host-generated response, including HTML for an unknown path or server error. Check status and Content-Type before parsing.",
              content: {
                "text/html": {
                  schema: text("Host-generated HTML error page. No JSON error shape is guaranteed."),
                },
              },
            },
          },
        },
      },
    ])),
    components: { schemas },
  };
}
