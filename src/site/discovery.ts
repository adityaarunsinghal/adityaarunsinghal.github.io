import { course, historical } from "../workshop/pages";
import { websiteAssistant } from "./assistant";
import { site } from "./content";

/** A physical Markdown file, independent of content negotiation or JavaScript. */
export function markdownPath(pathname: string): string {
  return pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}.md`;
}

export function agentInstructions(): string {
  return `# Using Aditya Singhal's public website

## When to use this site

Use this site to describe Aditya (Adi) Singhal's publicly stated work, find his public projects and writing, or locate lessons, released slides, starter code and recordings from his NYU Agentic AI workshops. It is useful for questions about the workshop curriculum and where to learn about agent harnesses, MCP, evaluation and multi-agent systems.

To ask Adi's website assistant a question, start with its [canonical PAP discovery document](${websiteAssistant.discoveryUrl}). For reading and retrieving public information, use [the reading map](${site.origin}/llms.txt), [developer guide](${site.origin}/developers/) and [OpenAPI specification](${site.origin}/openapi.json).

## Connect to the website assistant

${websiteAssistant.name} is hosted by Ambipath and can answer questions about his public work, projects and teaching. A PAP (Personal Agent Protocol) client can discover it at this exact URL:

\`\`\`text
${websiteAssistant.discoveryUrl}
\`\`\`

- [PAP discovery](${websiteAssistant.discoveryUrl}): public connection metadata.
- [MCP transport](${websiteAssistant.mcpUrl}): requires a valid PAP session.
- [Conversations endpoint](${websiteAssistant.conversationsUrl}): requires a valid PAP session.
- [Authentication issuer](${websiteAssistant.issuerUrl}): follow the authentication advertised in the discovery document.

Fetch the discovery document first and follow its current endpoints and authentication requirements. Conversation and MCP requests require a signed Poppy-Session; reading discovery does not create one. The client must support PAP authentication and session handling. Discovery alone does not guarantee compatibility with every agent or MCP client. If your client cannot establish a session, use [the assistant on the homepage](${site.origin}/) or read the public data below.

Messages sent to the assistant are processed by Ambipath. See [access details](${site.origin}/auth.md) and [privacy](${site.origin}/privacy/#site-assistant). Do not report that a conversation started unless the service confirms it.

## Read public data

All four endpoints accept ordinary HTTPS GET requests and require no account, API key, access token or payment:

- [API index](${site.origin}/api/v1/index.json): available resources and their URLs.
- [Public profile](${site.origin}/api/v1/profile.json): biography and profile links.
- [Resource directory](${site.origin}/api/v1/resources.json): public projects, writing and teaching links.
- [Workshops](${site.origin}/api/v1/workshops.json): current and archived course information and published materials.

These are complete, small JSON documents. Filter them locally; query parameters do not perform server-side search. Check the HTTP status and Content-Type before parsing JSON. Unknown paths return an HTML 404 from the static host.

For reading, use [the Markdown homepage](${site.origin}/index.md), [2026 course](${site.origin}/agentic-ai-workshop.md), [2025 archive](${site.origin}/agentic-ai-workshop-2025.md) or [developer guide](${site.origin}/developers.md).

## Optional browser tools

When a browser exposes WebMCP, the homepage, developer guide and both course pages register get_public_profile, find_public_resources and get_public_workshops. They read the same public data; resource search runs locally and does not send your query to a search service. Browser support is experimental. Use the HTTPS GET endpoints above when the browser does not expose these tools.

## Use and cite the sources

Use the canonical sourceUrl or workshop url in a response for readers. Keep the 2025 archive separate from the 2026 course. A missing recording or material is unavailable; do not invent a destination. Follow a linked project's own documentation for installation and authentication requirements. Course dates describe scheduled sessions, while modified dates describe published content updates.

The biography is Adi's first-party account, not independent verification of every claim. This site does not speak for his employer or provide Amazon account support. The static public data API is separate from the Ambipath-hosted assistant and cannot send messages, register for a class or make changes.

See [access details](${site.origin}/auth.md) and [privacy](${site.origin}/privacy/).
`;
}

export function accessInstructions(): string {
  return `# Access to Aditya Singhal's assistant and public resources

## Website assistant

The Ambipath-hosted assistant has a public [PAP discovery document](${websiteAssistant.discoveryUrl}). Fetching it requires no credentials. Use its advertised authentication and endpoints for a conversation:

- Canonical discovery URL: ${websiteAssistant.discoveryUrl}
- MCP transport: ${websiteAssistant.mcpUrl}
- Conversations endpoint: ${websiteAssistant.conversationsUrl}
- Authentication issuer: ${websiteAssistant.issuerUrl}

The MCP and conversations endpoints require a valid, signed Poppy-Session. Use a PAP-compatible client's authentication and session flow; a plain unauthenticated MCP connection or a successful discovery fetch is insufficient. Follow the current discovery document if its connection details change. Do not send a public data API request or a Firebase sign-in token as assistant authentication.

Client support varies. If your agent cannot complete PAP authentication, use [the homepage assistant](${site.origin}/) or the public reading resources below. Do not claim a conversation succeeded until the service confirms it. Messages you send to the assistant are processed by Ambipath; see [the privacy disclosure](${site.origin}/privacy/#site-assistant).

## Public access

The [public data API](${site.origin}/developers/) and the public reading documents hosted on adityasinghal.com are available without authentication. Use HTTPS GET. No registration, API key, OAuth access token, billing account or credential exchange is required. The [reading map](${site.origin}/llms.txt) also links to external websites, which control their own access requirements.

\`\`\`sh
curl --fail --show-error https://adityasinghal.com/api/v1/profile.json
\`\`\`

The static public data API is read-only. You can try its documented GET requests directly; there are no writes to undo and no separate sandbox. Do not send secrets in its URLs or Authorization headers. Its unauthenticated access policy does not apply to the separate assistant endpoints above.

## Responses and failures

Successful data responses use application/json. Follow redirects to the HTTPS canonical domain and check status and Content-Type before decoding a response. An unknown URL returns a genuine 404, normally with an HTML body. The static host can also return hosting or rate-limit errors. Consult [the API index](${site.origin}/api/v1/index.json) for supported paths. Respect Retry-After when it is supplied; use a small, bounded retry budget for temporary failures.

## Other websites

Public workshop information and code can link to third-party services. Course registration or student-only tools may require their own account and authorization. Follow the requirements of the destination; permission to read this API does not authorize actions on those services. Contact links open an external destination and do not submit a message through this API.
`;
}

export function sectionReadingMaps(): Record<string, string> {
  const maps = {
    "/developers/llms.txt": `# Aditya Singhal: assistant and developer resources

> Connect to Adi's Ambipath website assistant, or read public profile, project, writing and workshop information.

## Website assistant

- [Canonical PAP discovery](${websiteAssistant.discoveryUrl}): start here for a conversation with the website assistant.
- [MCP transport](${websiteAssistant.mcpUrl}): requires a signed PAP session and a compatible client.
- [Conversations endpoint](${websiteAssistant.conversationsUrl}): requires a signed PAP session.
- [Access details](${site.origin}/auth.md): assistant authentication and separate public data access.

Discovery is public. Conversation and MCP access require PAP authentication and session handling; not every agent client supports them. Use [the homepage assistant](${site.origin}/) if your client cannot connect.

## Public data

Use these resources to integrate the public information into a directory, learning assistant or profile summary. No account or API key is needed.

- [Developer guide](${site.origin}/developers.md): examples, response handling and version policy.
- [OpenAPI specification](${site.origin}/openapi.json): exact GET operations and response schemas.
- [API index](${site.origin}/api/v1/index.json): the four available data documents.
- [Agent instructions](${site.origin}/agents.md): source selection and citation guidance.
- [Access policy](${site.origin}/auth.md): assistant session requirements, unauthenticated public data and errors.
- [Root reading map](${site.origin}/llms.txt): profile, projects, writing and teaching.
`,
    [`${course.path}llms.txt`]: `# NYU Agentic AI Workshop 2026

> The current workshop taught by Adi Singhal and Luca Chang.

Use this section for the 2026 curriculum, schedule, released slides, starter code and recordings. Do not substitute the 2025 archive for current course information.

- [Course in Markdown](${site.origin}${markdownPath(course.path)}): the complete published course page.
- [Course webpage](${site.origin}${course.path}): interactive recordings and current information.
- [Public course repository](${course.publicRepositoryUrl}): released lessons and runnable examples.
- [Workshop data](${site.origin}/api/v1/workshops.json): structured course data and published resources.
- [2025 archive reading map](${site.origin}${course.archivePath}llms.txt): the earlier course.
`,
    [`${course.archivePath}llms.txt`]: `# NYU Agentic AI Workshop 2025 archive

> Historical course material; the 2025 course has concluded.

Use this section for the earlier curriculum and its recordings. For the current workshop use the 2026 page.

- [Archive in Markdown](${site.origin}${markdownPath(course.archivePath)}): the complete published archive page.
- [Archive webpage](${site.origin}${course.archivePath}): recordings and searchable chapters.
- [Public archive repository](${historical.repository}): historical course code.
- [2026 reading map](${site.origin}${course.path}llms.txt): the current course.
- [Workshop data](${site.origin}/api/v1/workshops.json): separate records for both years.
`,
  };
  return {
    ...maps,
    [`${course.currentPath}llms.txt`]: maps[`${course.path}llms.txt`],
  };
}

/** ARD is a draft resource catalog; the linked PAP document describes the assistant. */
export function resourceCatalog() {
  return {
    "$schema": "https://raw.githubusercontent.com/ards-project/ard-spec/main/spec/schemas/ard-entry.schema.json#/$defs/ArdManifest",
    entries: [
      {
        identifier: websiteAssistant.catalogIdentifier,
        displayName: websiteAssistant.name,
        description: "Ambipath-hosted assistant for questions about Adi's public work, projects and teaching. Public PAP discovery; conversation and MCP access require a signed PAP session and a compatible client.",
        type: "application/json",
        url: websiteAssistant.discoveryUrl,
        representativeQueries: [
          "Ask Adi's website assistant about his work and projects",
          "Ask the website assistant about Adi's NYU Agentic AI teaching",
        ],
      },
      {
        identifier: "urn:air:adityasinghal.com:api:public-data",
        displayName: "Aditya Singhal public data API",
        description: "Read-only public profile, projects, writing and NYU workshop data. No credentials required.",
        type: "application/vnd.oai.openapi+json;version=3.1.1",
        url: `${site.origin}/openapi.json`,
        representativeQueries: [
          "Retrieve Aditya Singhal's public profile and projects",
          "Find released NYU Agentic AI workshop recordings and materials",
        ],
      },
      {
        identifier: "urn:air:adityasinghal.com:docs:agent-guidance",
        displayName: "Aditya Singhal agent guidance",
        description: "When to use the public site, retrieve its data and cite the original sources.",
        type: "text/markdown",
        url: `${site.origin}/agents.md`,
        representativeQueries: [
          "How can an agent read Aditya Singhal's website?",
          "Which sources describe Adi Singhal's work and teaching?",
        ],
      },
      {
        identifier: "urn:air:adityasinghal.com:docs:workshop-2026",
        displayName: "NYU Agentic AI Workshop 2026",
        description: "Current curriculum, schedule, released slides, code and recordings.",
        type: "text/markdown",
        url: `${site.origin}${markdownPath(course.path)}`,
        representativeQueries: [
          "Where can I learn about agent harnesses and MCP?",
          "Find the 2026 NYU multi-agent systems workshop materials",
        ],
      },
    ],
  };
}

export function schemaMap(modified: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:sf="http://schema.org/schemas/schemafeed/0.1">
  <url>
    <loc>${site.origin}/feeds/site-schema.jsonl</loc>
    <lastmod>${modified}</lastmod>
    <sf:contentType>structuredData/schema.org</sf:contentType>
  </url>
</urlset>
`;
}
