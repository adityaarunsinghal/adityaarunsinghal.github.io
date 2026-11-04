# Access to Aditya Singhal's assistant and public resources

## Website assistant

The Ambipath-hosted assistant has a public [PAP discovery document](https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/.well-known/poppy.json). Fetching it requires no credentials. Use its advertised authentication and endpoints for a conversation:

- Canonical discovery URL: https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/.well-known/poppy.json
- MCP transport: https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/mcp
- Conversations endpoint: https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/conversations
- Authentication issuer: https://auth-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com

The MCP and conversations endpoints require a valid, signed Poppy-Session. Use a PAP-compatible client's authentication and session flow; a plain unauthenticated MCP connection or a successful discovery fetch is insufficient. Follow the current discovery document if its connection details change. Do not send a public data API request or a Firebase sign-in token as assistant authentication.

Client support varies. If your agent cannot complete PAP authentication, use [the homepage assistant](https://adityasinghal.com/) or the public reading resources below. Do not claim a conversation succeeded until the service confirms it. Messages you send to the assistant are processed by Ambipath; see [the privacy disclosure](https://adityasinghal.com/privacy/#site-assistant).

## Public access

The [public data API](https://adityasinghal.com/developers/) and the public reading documents hosted on adityasinghal.com are available without authentication. Use HTTPS GET. No registration, API key, OAuth access token, billing account or credential exchange is required. The [reading map](https://adityasinghal.com/llms.txt) also links to external websites, which control their own access requirements.

```sh
curl --fail --show-error https://adityasinghal.com/api/v1/profile.json
```

The static public data API is read-only. You can try its documented GET requests directly; there are no writes to undo and no separate sandbox. Do not send secrets in its URLs or Authorization headers. Its unauthenticated access policy does not apply to the separate assistant endpoints above.

## Responses and failures

Successful data responses use application/json. Follow redirects to the HTTPS canonical domain and check status and Content-Type before decoding a response. An unknown URL returns a genuine 404, normally with an HTML body. The static host can also return hosting or rate-limit errors. Consult [the API index](https://adityasinghal.com/api/v1/index.json) for supported paths. Respect Retry-After when it is supplied; use a small, bounded retry budget for temporary failures.

## Other websites

Public workshop information and code can link to third-party services. Course registration or student-only tools may require their own account and authorization. Follow the requirements of the destination; permission to read this API does not authorize actions on those services. Contact links open an external destination and do not submit a message through this API.
