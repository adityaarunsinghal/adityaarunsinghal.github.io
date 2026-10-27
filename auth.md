# Access to Aditya Singhal's public resources

## Public access

The [public data API](https://adityasinghal.com/developers/) and the public reading documents hosted on adityasinghal.com are available without authentication. Use HTTPS GET. No registration, API key, OAuth access token, billing account or credential exchange is required. The [reading map](https://adityasinghal.com/llms.txt) also links to external websites, which control their own access requirements.

```sh
curl --fail --show-error https://adityasinghal.com/api/v1/profile.json
```

The API is read-only. You can try its documented GET requests directly; there are no writes to undo and no separate sandbox. Do not send secrets in URLs or Authorization headers. This document describes the public API's access policy, not an OAuth authorization server.

## Responses and failures

Successful data responses use application/json. Follow redirects to the HTTPS canonical domain and check status and Content-Type before decoding a response. An unknown URL returns a genuine 404, normally with an HTML body. The static host can also return hosting or rate-limit errors. Consult [the API index](https://adityasinghal.com/api/v1/index.json) for supported paths. Respect Retry-After when it is supplied; use a small, bounded retry budget for temporary failures.

## Other websites

Public workshop information and code can link to third-party services. Course registration or student-only tools may require their own account and authorization. Follow the requirements of the destination; permission to read this API does not authorize actions on those services. Contact links open an external destination and do not submit a message through this API.
