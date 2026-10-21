import { pageDefinitions } from "../workshop/pages";
import { profileLinks } from "./content";

export const appPages = [
  { path: "/login/", title: "Sign in" },
  { path: "/progress/", title: "In My Element" },
  { path: "/lovesingy/", title: "Loves Ingy" },
  { path: "/translate/", title: "Translate" },
] as const;

// Shortcut destinations are deliberately separate from the public reading map.
// The résumé remains available by URL but is never advertised in discovery files.
export const shortcutPages = [
  { path: "/linkedin/", destination: profileLinks.linkedin, title: "Adi Singhal on LinkedIn" },
  { path: "/github/", destination: profileLinks.github, title: "Adi Singhal on GitHub" },
  { path: "/instagram/", destination: profileLinks.instagram, title: "Adi Singhal on Instagram" },
  { path: "/facebook/", destination: profileLinks.facebook, title: "Adi Singhal on Facebook" },
  { path: "/youtube/", destination: profileLinks.youtube, title: "Adi Singhal on YouTube" },
  { path: "/x/", destination: profileLinks.x, title: "Adi Singhal on X" },
  { path: "/twitter/", destination: profileLinks.x, title: "Adi Singhal on X" },
  { path: "/wife/", destination: "https://www.instagram.com/ingy.fs", title: "Ingy on Instagram" },
  { path: "/latest-resume/", destination: "/Aditya_Singhal_Resume_2026-06-09.pdf", title: "Aditya Singhal's résumé", unlisted: true },
] as const;

export type ShortcutPage = (typeof shortcutPages)[number];

function routeKey(pathname: string) {
  return pathname.replace(/\/index\.html$/i, "/").replace(/\/+$/, "").toLowerCase();
}

export const routeEntries: [string, string][] = [
  ["", "/"],
  ["/static", "/static/"],
  ["/404", "/404.html"],
  ...appPages.map((page): [string, string] => [routeKey(page.path), page.path]),
  ...shortcutPages.map((page): [string, string] => [routeKey(page.path), page.path]),
  ...pageDefinitions.map((page): [string, string] => [routeKey(page.path), page.canonical]),
];

const canonicalRoutes = new Map(routeEntries);

export function canonicalLocalRoute(pathname: string): string | null {
  try {
    return canonicalRoutes.get(routeKey(decodeURIComponent(pathname))) ?? null;
  } catch {
    return null;
  }
}

// Pure implementation shared by the generated browser compatibility script
// and its tests. Targets can only come from the known same-origin route map.
export function legacyTarget(
  pathname: string,
  search: string,
  hash: string,
  entries: [string, string][] = routeEntries,
): string | null {
  const legacy = search.startsWith("?/");
  let requestedPath = pathname;
  let query = search;
  if (legacy) {
    const decoded = search.slice(1).split("&").map((part) =>
      part.replace(/~and~/g, "&"),
    ).join("?");
    const separator = decoded.indexOf("?");
    requestedPath = separator < 0 ? decoded : decoded.slice(0, separator);
    query = separator < 0 ? "" : decoded.slice(separator);
  }
  let key: string;
  try {
    key = decodeURIComponent(requestedPath)
      .replace(/\/index\.html$/i, "/")
      .replace(/\/+$/, "")
      .toLowerCase();
  } catch {
    return legacy ? "/404.html" : null;
  }
  const destination = new Map(entries).get(key);
  if (!destination) return legacy ? "/404.html" : null;
  const target = `${destination}${query}${hash}`;
  return target === `${pathname}${search}${hash}` ? null : target;
}
