# Using Aditya Singhal's public website

## When to use this site

Use this site to describe Aditya (Adi) Singhal's publicly stated work, find his public projects and writing, or locate lessons, released slides, starter code and recordings from his NYU Agentic AI workshops. It is useful for questions about the workshop curriculum and where to learn about agent harnesses, MCP, evaluation and multi-agent systems.

To ask Adi's website assistant a question, start with its [public connection instructions](https://console.ambipath.com/api/v1/public/a6436a43-e728-456d-879c-c7674b0d814f/agent.md). For reading and retrieving public information, use [the reading map](https://adityasinghal.com/llms.txt), [developer guide](https://adityasinghal.com/developers/) and [public data OpenAPI specification](https://adityasinghal.com/openapi.json).

## Ask Adi's assistant

Website: https://adityasinghal.com/

Public questions can be asked without a browser or customer sign-in.

- Connection instructions: https://console.ambipath.com/api/v1/public/a6436a43-e728-456d-879c-c7674b0d814f/agent.md
- Guest HTTP API: https://console.ambipath.com/api/v1/public/a6436a43-e728-456d-879c-c7674b0d814f
- API contract: https://console.ambipath.com/api/public-openapi.json
- PAP discovery: https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/.well-known/poppy.json

Use the guest HTTP API when your client does not support PAP. A PAP client signs a fresh Poppy-Session proof for each request using its own published identity. A missing proof is not a request to sign in as the website owner.


The guest HTTP API creates a conversation scoped to its own bearer. Follow the current connection instructions to send one question, poll the same conversation for its answer, and close a completed test conversation. Keep the session bearer and recovery secret private.

PAP-compatible clients can use the manifest's [MCP transport](https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/mcp) or [conversations endpoint](https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/conversations) with signed request proofs. The [authentication issuer](https://auth-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com) supports optional customer-account access; public questions do not require a customer account or owner sign-in.

Messages sent to the assistant are processed by Ambipath. See [access details](https://adityasinghal.com/auth.md) and [privacy](https://adityasinghal.com/privacy/#site-assistant). Do not report that a conversation started unless the service confirms it.

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

The biography is Adi's first-party account, not independent verification of every claim. This site does not speak for his employer or provide Amazon account support. The static public data API is separate from the Ambipath-hosted assistant and cannot send messages, register for a class or make changes.

See [access details](https://adityasinghal.com/auth.md) and [privacy](https://adityasinghal.com/privacy/).
