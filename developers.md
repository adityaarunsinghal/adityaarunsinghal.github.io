# Aditya Singhal for developers & agents

Source: https://adityasinghal.com/developers/

Public content



Read my public profile, projects and workshop materials as JSON or Markdown.

These resources mirror the public website. Reading them is free and requires no account or API key.

[OpenAPI specification](https://adityasinghal.com/openapi.json) [Reading guide for agents](https://adityasinghal.com/llms.txt)

## When to use these resources

-   Check my public background, areas of work and official profile links.
-   Find my published projects and writing, then follow their original sources.
-   Look up the current NYU Agentic AI workshop, released materials, recordings and chapter links.
-   Consult the separately labeled 2025 archive for that year's course.

Use the canonical page linked in each record when citing a fact. Chapter names help locate a recording; they are not a transcript. This site describes my work and teaching, and does not speak for Amazon, AWS or NYU.

## JSON endpoints

Send a public `GET` request to an endpoint below. Responses use `application/json`. All operations are read-only and return complete documents; filter them in your own client.

Public content API, version 1
| Endpoint | Contents |
| --- | --- |
| [`/api/v1/index.json`](https://adityasinghal.com/api/v1/index.json) | Discover the available public JSON documents and their documentation. |
| [`/api/v1/profile.json`](https://adityasinghal.com/api/v1/profile.json) | Read the biography, professional interests and profile links published on the personal website. |
| [`/api/v1/resources.json`](https://adityasinghal.com/api/v1/resources.json) | Read the site's public reading map. Filter its small resource list in your client. |
| [`/api/v1/workshops.json`](https://adityasinghal.com/api/v1/workshops.json) | Read the published course information, material links and available recording chapters for the 2026 and 2025 workshops. |

Each response identifies its `apiVersion`, canonical `sourceUrl` and content modification date in `modified`. The [OpenAPI specification](https://adityasinghal.com/openapi.json) documents response fields and operation IDs.

There are no write operations, registration actions or account-data endpoints in this public API. Some linked materials require registered-student access, as labeled in each record.

## Fetch the public profile

Check the status and content type before parsing a response. An unavailable path can return an HTML error page, even if the request asks for JSON.

### curl and a POSIX shell

```
body=$(mktemp)
trap 'rm -f "$body"' EXIT
response=$(curl --silent --show-error --location \
  --output "$body" --write-out '%{http_code} %{content_type}' \
  https://adityasinghal.com/api/v1/profile.json) || exit 1
case "$response" in
  "200 application/json"|"200 application/json;"*) cat "$body" ;;
  *) printf '%s\n' "Unexpected response: $response" >&2; exit 1 ;;
esac
```

### Browser JavaScript

```
const response = await fetch("https://adityasinghal.com/api/v1/profile.json", {
  credentials: "omit",
});
const type = response.headers.get("content-type") || "";
if (!response.ok || type.split(";")[0].trim() !== "application/json") {
  throw new Error("Expected JSON; received HTTP " + response.status);
}
const profile = await response.json();
console.log(profile.name);
```

### Python standard library

```
import json
from urllib.request import urlopen

url = "https://adityasinghal.com/api/v1/profile.json"
with urlopen(url, timeout=15) as response:
    if response.status != 200:
        raise RuntimeError("Unexpected HTTP status")
    if response.headers.get_content_type() != "application/json":
        raise RuntimeError("Expected a JSON response")
    profile = json.load(response)
print(profile["name"])
```

## Caching, errors and versions

These are static files on GitHub Pages. Respect the response's cache headers and use conditional requests when the host supplies `ETag` or `Last-Modified`. Content changes when the site is published; `modified` is a content date, not a live-data timestamp.

For a missing document, check the [API index](https://adityasinghal.com/api/v1/index.json) and your path. Do not retry a `404` in a loop. Retry temporary network or server failures sparingly, with a delay that increases between attempts; honor `Retry-After` when present. The hosting provider controls availability and request limits.

Version 1 may gain fields or records. Clients should tolerate unknown fields and empty lists. A future breaking contract will use a new versioned path.

## Read the pages directly

Markdown is useful for reading and quoting the page's content. JSON is useful for selecting individual profile, resource and workshop records.

-   [Homepage in Markdown](https://adityasinghal.com/index.md)
-   [2026 workshop in Markdown](https://adityasinghal.com/agentic-ai-workshop.md)
-   [2025 archive in Markdown](https://adityasinghal.com/agentic-ai-workshop-2025.md)
-   [This guide in Markdown](https://adityasinghal.com/developers.md)
-   [Public reading map](https://adityasinghal.com/llms.txt)

Public project links describe those projects' own capabilities. A workshop that teaches MCP, or a linked project with a CLI, is not an MCP server or CLI for this website.

## Experimental browser tools

Browsers that expose [WebMCP](https://webmachinelearning.github.io/webmcp/) can discover three read-only tools on this guide, the homepage and both workshop pages: `get_public_profile`, `find_public_resources` and `get_public_workshops`.

They read the same JSON documents listed above. Resource filtering happens locally in the browser. Support is experimental and depends on the browser; ordinary HTTPS requests and Markdown work without it.

## Website source

The [public website repository](https://github.com/adityaarunsinghal/adityaarunsinghal.github.io) contains the document generators and source data. See [repository development instructions](https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/blob/master/CLAUDE.md) and the [workshop contribution instructions](https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/blob/master/src/workshop/AGENTS.md) before proposing changes.
