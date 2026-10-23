import homeTemplate from "./home.html?raw";
import { pageDefinitions } from "../workshop/pages";
import { profileLinks, readingMap, site } from "./content";
import { legacyTarget, routeEntries, type ShortcutPage } from "./routes";
import { analyticsHead } from "./analytics";

export { site, profileLinks, readingMap } from "./content";
export { appPages, shortcutPages, canonicalLocalRoute, legacyTarget } from "./routes";

export const publicPages = [
  { path: "/", modified: site.modified },
  ...pageDefinitions
    .filter((page) => page.kind === "current" || page.kind === "archive")
    .map((page) => ({ path: page.path, modified: undefined })),
];

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function profileGraph() {
  const home = `${site.origin}/`;
  const person = `${home}#person`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite", "@id": `${home}#website`,
        url: home, name: site.name, alternateName: site.alternateName,
      },
      {
        "@type": "ProfilePage", "@id": `${home}#profile`,
        url: home, name: site.title, dateModified: site.modified,
        mainEntity: { "@id": person }, isPartOf: { "@id": `${home}#website` },
      },
      {
        "@type": "Person", "@id": person,
        name: site.name, alternateName: site.alternateName,
        url: home, description: site.description,
        image: `${site.origin}${site.portrait}`,
        jobTitle: site.jobTitle,
        worksFor: { "@type": "Organization", name: site.employer },
        knowsAbout: ["Agentic AI", "Model Context Protocol (MCP)", "RAG systems", "AI evaluation"],
        sameAs: Object.values(profileLinks),
      },
    ],
  };
}

function homeHead(compatibilityScript: string) {
  const title = escapeHtml(site.title);
  const description = escapeHtml(site.description);
  const image = `${site.origin}${site.socialImage}`;
  return `<meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="google-site-verification" content="${escapeHtml(site.googleVerification)}" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="author" content="${escapeHtml(site.name)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${site.origin}/" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />
  <meta name="theme-color" content="#091126" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${site.origin}/" />
  <meta property="og:site_name" content="${escapeHtml(site.name)}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Aditya (Adi) Singhal — Agentic AI, MCP, and evaluation" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${site.origin}/" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="Aditya (Adi) Singhal — Agentic AI, MCP, and evaluation" />
  <script type="application/ld+json">${safeJson(profileGraph())}</script>
  <script src="${escapeHtml(compatibilityScript)}" defer></script>
  ${analyticsHead()}`;
}

export function renderHome(compatibilityScript = "/__site/routes.js"): string {
  const values: Record<string, string> = {
    "site.head": homeHead(compatibilityScript),
    "site.name": escapeHtml(site.name),
    "site.headline": escapeHtml(site.headline),
    "site.biography": escapeHtml(site.biography),
    ...Object.fromEntries(Object.entries(profileLinks).map(([name, value]) =>
      [`link.${name}`, escapeHtml(value)],
    )),
  };
  return homeTemplate.replace(/\{\{((?:site|link)\.[\w]+)\}\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Unknown homepage value: ${key}`);
    return values[key];
  });
}

export function renderCompatibilityScript(): string {
  return `// Preserve known bookmarks from the previous GitHub Pages SPA routing.\n(() => {\n  const next = (${legacyTarget.toString()})(window.location.pathname, window.location.search, window.location.hash, ${safeJson(routeEntries)});\n  if (next) window.location.replace(next);\n})();\n`;
}

export function renderShortcut(page: ShortcutPage): string {
  const destination = page.destination.startsWith("/")
    ? `${site.origin}${page.destination}` : page.destination;
  // The HTML link/refresh use the relative destination for local previews too.
  const href = escapeHtml(page.destination);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, ${"unlisted" in page ? "nofollow" : "follow"}" />
  <meta http-equiv="refresh" content="0; url=${href}" />
  <title>${escapeHtml(page.title)}</title>
  <link rel="canonical" href="${escapeHtml(destination)}" />
</head>
<body>
  <p>Continue to <a href="${href}">${escapeHtml(page.title)}</a>.</p>
</body>
</html>
`;
}

export function renderNotFound(compatibilityScript = "/__site/routes.js"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, follow" />
  <title>Page not found | Aditya Singhal</title>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <script src="${escapeHtml(compatibilityScript)}" defer></script>
  <style>
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; min-height:100svh; display:grid; place-items:center; padding:1.5rem; background:#f6f8fa; color:#213547; font:1rem/1.6 system-ui,sans-serif; }
    main { width:min(40rem,100%); padding:1rem 0; text-align:center; }
    h1 { margin:0; font-size:clamp(1.5rem,4vw,2rem); line-height:1.2; }
    p { margin:1rem 0; }
    picture { display:block; margin:1.5rem 0; }
    img { display:block; width:100%; height:auto; border-radius:8px; }
    .home-link { display:inline-flex; align-items:center; justify-content:center; padding:0.75rem 1.5rem; border-radius:6px; background:#176e3f; color:#fff; font-weight:600; text-decoration:none; }
    .home-link:hover { background:#145c35; }
    .home-link:focus-visible { outline:3px solid #165aa7; outline-offset:4px; }
    @media (prefers-color-scheme:dark) {
      body { background:#091126; color:#f4f6fc; }
      .home-link:focus-visible { outline-color:#c5d5ff; }
    }
  </style>
</head>
<body>
  <main>
    <h1>What URL is that???</h1>
    <p>Even the kid is confused.</p>
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcset="/404-still.webp" />
      <img src="/404.webp" width="640" height="440" alt="A child shrugging" loading="lazy" decoding="async" />
    </picture>
    <a class="home-link" href="/">Go Home</a>
  </main>
</body>
</html>
`;
}

export function renderReadingMap(): string {
  return `# Aditya (Adi) Singhal\n\n> ${site.description}\n\nHis work includes production RAG infrastructure, MCP-based engineering automation, and LLM evaluation. His current Applied Scientist role is at Amazon; his earlier AWS Bedrock role was in software engineering.\n\n${readingMap.map((group) =>
    `## ${group.heading}\n\n${group.links.map((link) =>
      `- [${link.name}](${link.url}): ${link.description}`,
    ).join("\n")}`,
  ).join("\n\n")}\n`;
}

export function renderSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map((page) =>
    `  <url><loc>${site.origin}${page.path}</loc>${page.modified ? `<lastmod>${page.modified}</lastmod>` : ""}</url>`,
  ).join("\n")}\n</urlset>\n`;
}
