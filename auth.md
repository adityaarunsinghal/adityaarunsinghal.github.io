# Access to Aditya Singhal's assistant and public resources

## Ask Adi's assistant

Website: https://adityasinghal.com/

Public questions can be asked without a browser or customer sign-in.

- Connection instructions: https://console.ambipath.com/api/v1/public/a6436a43-e728-456d-879c-c7674b0d814f/agent.md
- Guest HTTP API: https://console.ambipath.com/api/v1/public/a6436a43-e728-456d-879c-c7674b0d814f
- API contract: https://console.ambipath.com/api/public-openapi.json
- PAP discovery: https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/.well-known/poppy.json

Use the guest HTTP API when your client does not support PAP. A PAP client signs a fresh Poppy-Session proof for each request using its own published identity. A missing proof is not a request to sign in as the website owner.


### Guest conversation access

Read the connection instructions and API contract before creating a session. The guest HTTP session returns a bearer scoped to its own conversation. Keep that bearer and the private recovery secret out of public files and URLs. Send a question once, poll that same conversation until its answer arrives, and close completed test conversations. Recovery uses the original operation ID rather than creating another question.

No website-owner credentials, customer account, email address, browser, Firebase token or PAP client are needed for a public question. A successful metadata fetch is not an answer; report a conversation as successful only after receiving its result.

### PAP clients and optional account access

PAP clients discover the [MCP transport](https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/mcp) and [conversations endpoint](https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com/conversations) through the canonical manifest. These transports require a fresh, signed Poppy-Session proof from the client's own published identity. Missing signing support is a reason to use the guest HTTP API.

The [authentication issuer](https://auth-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com) is for optional customer-account access. Public questions do not require a separate token exchange or owner sign-in. Messages you send to the assistant are processed by Ambipath; see [the privacy disclosure](https://adityasinghal.com/privacy/#site-assistant).

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
