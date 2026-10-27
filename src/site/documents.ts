import { apiEndpoints } from "./agent-data";
import { profileLinks, site } from "./content";
import { documentPages } from "./document-pages";
export { documentPages } from "./document-pages";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function codeExample(label: string, code: string): string {
  return `<div class="code-example"><h3>${escapeHtml(label)}</h3><pre tabindex="0" aria-label="${escapeHtml(label)} example"><code>${escapeHtml(code)}</code></pre></div>`;
}

function developersBody(): string {
  const profileUrl = `${site.origin}/api/v1/profile.json`;
  const curl = String.raw`body=$(mktemp)
trap 'rm -f "$body"' EXIT
response=$(curl --silent --show-error --location \
  --output "$body" --write-out '%{http_code} %{content_type}' \
  ${profileUrl}) || exit 1
case "$response" in
  "200 application/json"|"200 application/json;"*) cat "$body" ;;
  *) printf '%s\n' "Unexpected response: $response" >&2; exit 1 ;;
esac`;
  const javascript = `const response = await fetch("${profileUrl}", {
  credentials: "omit",
});
const type = response.headers.get("content-type") || "";
if (!response.ok || type.split(";")[0].trim() !== "application/json") {
  throw new Error("Expected JSON; received HTTP " + response.status);
}
const profile = await response.json();
console.log(profile.name);`;
  const python = `import json
from urllib.request import urlopen

url = "${profileUrl}"
with urlopen(url, timeout=15) as response:
    if response.status != 200:
        raise RuntimeError("Unexpected HTTP status")
    if response.headers.get_content_type() != "application/json":
        raise RuntimeError("Expected a JSON response")
    profile = json.load(response)
print(profile["name"])`;

  return `<header class="document-intro">
    <p class="document-eyebrow">Public content</p>
    <h1>${escapeHtml(site.name)} for developers &amp; agents</h1>
    <p class="document-lead">Read my public profile, projects and workshop materials as JSON or Markdown.</p>
    <p>These resources mirror the public website. Reading them is free and requires no account or API key.</p>
    <div class="document-actions">
      <a class="document-button" href="/openapi.json">OpenAPI specification <span aria-hidden="true">↗</span></a>
      <a href="/llms.txt">Reading guide for agents</a>
    </div>
  </header>

  <section aria-labelledby="when-to-use">
    <h2 id="when-to-use">When to use these resources</h2>
    <ul>
      <li>Check my public background, areas of work and official profile links.</li>
      <li>Find my published projects and writing, then follow their original sources.</li>
      <li>Look up the current NYU Agentic AI workshop, released materials, recordings and chapter links.</li>
      <li>Consult the separately labeled 2025 archive for that year's course.</li>
    </ul>
    <p>Use the canonical page linked in each record when citing a fact. Chapter names help locate a recording; they are not a transcript. This site describes my work and teaching, and does not speak for Amazon, AWS or NYU.</p>
  </section>

  <section aria-labelledby="json-endpoints">
    <h2 id="json-endpoints">JSON endpoints</h2>
    <p>Send a public <code>GET</code> request to an endpoint below. Responses use <code>application/json</code>. All operations are read-only and return complete documents; filter them in your own client.</p>
    <div class="endpoint-table-wrap">
      <table class="endpoint-table">
        <caption>Public content API, version 1</caption>
        <thead><tr><th scope="col">Endpoint</th><th scope="col">Contents</th></tr></thead>
        <tbody>${apiEndpoints.map((endpoint) => `
          <tr><th scope="row"><a href="${escapeHtml(endpoint.path)}"><code>${escapeHtml(endpoint.path)}</code></a></th><td>${escapeHtml(endpoint.description)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
    <p>Each response identifies its <code>apiVersion</code>, canonical <code>sourceUrl</code> and content modification date in <code>modified</code>. The <a href="/openapi.json">OpenAPI specification</a> documents response fields and operation IDs.</p>
    <p>There are no write operations, registration actions or account-data endpoints in this public API. Some linked materials require registered-student access, as labeled in each record.</p>
  </section>

  <section aria-labelledby="quickstart">
    <h2 id="quickstart">Fetch the public profile</h2>
    <p>Check the status and content type before parsing a response. An unavailable path can return an HTML error page, even if the request asks for JSON.</p>
    ${codeExample("curl and a POSIX shell", curl)}
    ${codeExample("Browser JavaScript", javascript)}
    ${codeExample("Python standard library", python)}
  </section>

  <section aria-labelledby="reliable-use">
    <h2 id="reliable-use">Caching, errors and versions</h2>
    <p>These are static files on GitHub Pages. Respect the response's cache headers and use conditional requests when the host supplies <code>ETag</code> or <code>Last-Modified</code>. Content changes when the site is published; <code>modified</code> is a content date, not a live-data timestamp.</p>
    <p>For a missing document, check the <a href="/api/v1/index.json">API index</a> and your path. Do not retry a <code>404</code> in a loop. Retry temporary network or server failures sparingly, with a delay that increases between attempts; honor <code>Retry-After</code> when present. The hosting provider controls availability and request limits.</p>
    <p>Version 1 may gain fields or records. Clients should tolerate unknown fields and empty lists. A future breaking contract will use a new versioned path.</p>
  </section>

  <section aria-labelledby="reading-formats">
    <h2 id="reading-formats">Read the pages directly</h2>
    <p>Markdown is useful for reading and quoting the page's content. JSON is useful for selecting individual profile, resource and workshop records.</p>
    <ul class="document-link-list">
      <li><a href="/index.md">Homepage in Markdown</a></li>
      <li><a href="/agentic-ai-workshop.md">2026 workshop in Markdown</a></li>
      <li><a href="/agentic-ai-workshop-2025.md">2025 archive in Markdown</a></li>
      <li><a href="/developers.md">This guide in Markdown</a></li>
      <li><a href="/llms.txt">Public reading map</a></li>
    </ul>
    <p>Public project links describe those projects' own capabilities. A workshop that teaches MCP, or a linked project with a CLI, is not an MCP server or CLI for this website.</p>
  </section>

  <section aria-labelledby="browser-tools">
    <h2 id="browser-tools">Experimental browser tools</h2>
    <p>Browsers that expose <a href="https://webmachinelearning.github.io/webmcp/">WebMCP</a> can discover three read-only tools on this guide, the homepage and both workshop pages: <code>get_public_profile</code>, <code>find_public_resources</code> and <code>get_public_workshops</code>.</p>
    <p>They read the same JSON documents listed above. Resource filtering happens locally in the browser. Support is experimental and depends on the browser; ordinary HTTPS requests and Markdown work without it.</p>
  </section>

  <section aria-labelledby="source">
    <h2 id="source">Website source</h2>
    <p>The <a href="https://github.com/adityaarunsinghal/adityaarunsinghal.github.io">public website repository</a> contains the document generators and source data. See <a href="https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/blob/master/CLAUDE.md">repository development instructions</a> and the <a href="https://github.com/adityaarunsinghal/adityaarunsinghal.github.io/blob/master/src/workshop/AGENTS.md">workshop contribution instructions</a> before proposing changes.</p>
  </section>`;
}

function privacyBody(): string {
  return `<header class="document-intro">
    <p class="document-eyebrow">About this website</p>
    <h1>Privacy</h1>
    <p class="document-lead">How this website handles visits, analytics and embedded content.</p>
    <p>This is ${escapeHtml(site.name)}'s personal website. Public pages and content downloads can be read without signing in. This page describes the services used here and the choices available in your browser.</p>
    <p class="document-updated">Last reviewed <time datetime="2026-10-27">October 27, 2026</time>.</p>
  </header>

  <section aria-labelledby="hosting">
    <h2 id="hosting">Hosting and request data</h2>
    <p>GitHub Pages hosts this site. Requests to the site reach GitHub's infrastructure, which may process technical information such as your IP address, browser and request time to deliver and protect the service. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub's privacy statement</a> for its handling of that information.</p>
  </section>

  <section aria-labelledby="analytics">
    <h2 id="analytics">Public-page analytics</h2>
    <p>The homepage and the 2026 and 2025 workshop pages use Google Analytics 4 to understand visits and use of public resources. Google's tag uses cookies and processes usage and device information. The site has Google signals and advertising personalization signals disabled.</p>
    <p>The site's custom events record page views and selected resource, social-link and video interactions. Their page address is the canonical page URL, without query strings or fragments; their referrer is reduced to its origin. Those custom events do not include chapter-search text, email addresses, complete outbound URLs or private application content.</p>
    <p>The developer guide, this privacy page and public JSON or Markdown files do not load the analytics tag. You can restrict cookies or block analytics requests through your browser. Google also provides an <a href="https://tools.google.com/dlpage/gaoptout">Analytics opt-out browser add-on</a>. See <a href="https://policies.google.com/privacy">Google's privacy policy</a> for information about its services.</p>
  </section>

  <section aria-labelledby="fonts">
    <h2 id="fonts">Fonts and video</h2>
    <p>The homepage requests its font stylesheet and font files from Google Fonts. This sends technical request information to Google. The workshop fonts are served from this website. See <a href="https://developers.google.com/fonts/faq/privacy">Google Fonts' privacy information</a>.</p>
    <p>Personal-video previews on the homepage are stored on this site. A YouTube player loads after you choose a video. Workshop recordings use lazy-loaded YouTube players, which can contact YouTube as they approach the visible part of the page, before playback.</p>
    <p>The embedded players use YouTube's privacy-enhanced domain, <code>youtube-nocookie.com</code>. Loading or playing a video still involves requests to YouTube and related services. See <a href="https://support.google.com/youtube/answer/171780">YouTube's explanation of privacy-enhanced embeds</a>. You can follow the ordinary video links to watch on YouTube instead.</p>
  </section>

  <section aria-labelledby="external-services">
    <h2 id="external-services">Forms, messages and other websites</h2>
    <p>Workshop forms open Google Forms, and information submitted there goes to the form owner. Social profiles, code repositories, publications and book-purchase links open their respective services. Their privacy practices apply when you visit, sign in or submit information there.</p>
    <p>Choosing a contact link does not send a message on your behalf. You decide what to share in the destination service.</p>
  </section>

  <section aria-labelledby="signed-in">
    <h2 id="signed-in">Signed-in utilities and browser storage</h2>
    <p>Separate private utilities use Google sign-in through Firebase Authentication and store authorized application data in Firebase Firestore. Authentication information and application data are used to provide access to those utilities. The public profile and workshop pages do not require this sign-in.</p>
    <p>Firebase can keep sign-in state and cached application data in your browser. Sign out after use on a shared device; browser settings can also clear this site's stored data. Clearing browser storage does not by itself delete data stored by a service.</p>
  </section>

  <section aria-labelledby="privacy-questions">
    <h2 id="privacy-questions">Questions</h2>
    <p>You can reach me through the profiles in the <a href="/#contact">Contact section</a>, including <a href="${escapeHtml(profileLinks.linkedin)}">LinkedIn</a>. Describe the page or feature you are asking about without sending passwords, access tokens or other sensitive credentials.</p>
  </section>`;
}

export function renderDocument(pathname: string): string | undefined {
  const page = documentPages.find((entry) => entry.path === pathname);
  if (!page) return undefined;
  const markdown = `${page.path.slice(0, -1)}.md`;
  const body = pathname === "/developers/" ? developersBody() : privacyBody();
  const canonical = `${site.origin}${page.path}`;
  const graph = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical,
    url: canonical,
    name: page.title,
    description: page.description,
    dateModified: page.modified,
    isPartOf: { "@id": `${site.origin}/#website` },
    author: { "@id": `${site.origin}/#person` },
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  <meta name="author" content="${escapeHtml(site.name)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" type="text/markdown" href="${site.origin}${markdown}" />
  <link rel="service-desc" type="application/vnd.oai.openapi+json" href="${site.origin}/openapi.json" />
  <link rel="ard" type="application/json" href="${site.origin}/.well-known/ard.json" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="stylesheet" href="/site-documents.css" />
  <meta name="theme-color" content="#f6f8fb" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#101827" media="(prefers-color-scheme: dark)" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(page.title)}" />
  <meta property="og:description" content="${escapeHtml(page.description)}" />
  <meta property="og:image" content="${site.origin}${site.socialImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>
  ${pathname === "/developers/" ? '<script src="/site-agent-tools.js" defer></script>' : ""}
</head>
<body class="site-document">
  <a class="document-skip-link" href="#main-content">Skip to content</a>
  <header class="document-header">
    <a class="document-home" href="/">${escapeHtml(site.name)}</a>
    <nav aria-label="Site">
      <a href="/agentic-ai-workshop/">Workshop</a>
      <a href="/developers/"${pathname === "/developers/" ? ' aria-current="page"' : ""}>Developers</a>
      <a href="/privacy/"${pathname === "/privacy/" ? ' aria-current="page"' : ""}>Privacy</a>
    </nav>
  </header>
  <main id="main-content">
    <article class="document-content">${body}</article>
  </main>
  <footer class="document-footer">
    <a href="/">Back to the homepage</a>
    <a href="${markdown}">Read as Markdown</a>
  </footer>
</body>
</html>
`;
}
