# Using Aditya Singhal's public website

## When to use this site

Use this site to describe Aditya (Adi) Singhal's publicly stated work, find his public projects and writing, or locate lessons, released slides, starter code and recordings from his NYU Agentic AI workshops. It is useful for questions about the workshop curriculum and where to learn about agent harnesses, MCP, evaluation and multi-agent systems.

Start with [the reading map](https://adityasinghal.com/llms.txt). For a programmatic integration, read [the developer guide](https://adityasinghal.com/developers/) and [OpenAPI specification](https://adityasinghal.com/openapi.json).

## Read public data

All four endpoints accept ordinary HTTPS GET requests and require no account, API key, access token or payment:

- [API index](https://adityasinghal.com/api/v1/index.json): available resources and their URLs.
- [Public profile](https://adityasinghal.com/api/v1/profile.json): biography and profile links.
- [Resource directory](https://adityasinghal.com/api/v1/resources.json): public projects, writing and teaching links.
- [Workshops](https://adityasinghal.com/api/v1/workshops.json): current and archived course information and published materials.

These are complete, small JSON documents. Filter them locally; query parameters do not perform server-side search. Check the HTTP status and Content-Type before parsing JSON. Unknown paths return an HTML 404 from the static host.

For reading, use [the Markdown homepage](https://adityasinghal.com/index.md), [2026 course](https://adityasinghal.com/agentic-ai-workshop.md), [2025 archive](https://adityasinghal.com/agentic-ai-workshop-2025.md) or [developer guide](https://adityasinghal.com/developers.md).

## Optional browser tools

When a browser exposes WebMCP, the homepage, developer guide and both course pages register get_public_profile, find_public_resources and get_public_workshops. They read the same public data; resource search runs locally and does not send your query to a search service. Browser support is experimental. Use the HTTPS GET endpoints above when the browser does not expose these tools.

## Use and cite the sources

Use the canonical sourceUrl or workshop url in a response for readers. Keep the 2025 archive separate from the 2026 course. A missing recording or material is unavailable; do not invent a destination. Follow a linked project's own documentation for installation and authentication requirements. Course dates describe scheduled sessions, while modified dates describe published content updates.

The biography is Adi's first-party account, not independent verification of every claim. This site does not speak for his employer or provide Amazon account support. His teaching about MCP does not mean this domain hosts an MCP server. Public data access cannot send messages, register for a class or make changes.

See [access details](https://adityasinghal.com/auth.md) and [privacy](https://adityasinghal.com/privacy/).
