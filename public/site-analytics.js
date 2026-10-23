// Public-page analytics. No app state, queries, fragments, email addresses,
// free-form labels or complete outbound URLs enter these event payloads.
(() => {
  const id = document.currentScript?.dataset.measurementId;
  if (!/^G-[A-Z0-9]+$/.test(id || "") || window.__publicAnalyticsStarted) return;
  const origin = "https://adityasinghal.com";
  const paths = new Set(["/", "/agentic-ai-workshop/", "/agentic-ai-workshop-2025/"]);
  const aliases = new Set(["/", "/static/"]);
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  let canonical;
  try {
    canonical = new URL(canonicalLink?.href);
  } catch {
    return;
  }
  const path = canonical.pathname;
  if (window.location.origin !== origin || canonical.origin !== origin ||
      canonical.search || canonical.hash || !paths.has(path)) return;
  if (!(window.location.pathname === path || (path === "/" && aliases.has(window.location.pathname)))) return;
  if (window.location.search.startsWith("?/")) return; // Old app-route bookmarks normalize first.
  if (/\bnoindex\b/i.test(document.querySelector('meta[name="robots"]')?.content || "")) return;
  if (document.getElementById("root")) return;
  window.__publicAnalyticsStarted = true;

  let referrer = "";
  try {
    const url = new URL(document.referrer);
    if (/^https?:$/.test(url.protocol)) referrer = url.origin + "/";
  } catch {
    // No referrer is expected for direct navigation.
  }
  const page = {
    page_location: canonical.href,
    page_referrer: referrer,
    page_title: document.title,
  };
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const gtag = window.gtag;
  gtag("js", new Date());
  gtag("set", page);
  gtag("config", id, {
    ...page, send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  gtag("event", "page_view", { ...page, send_to: id });
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.append(tag);

  function emit(name, parameters) {
    gtag("event", name, { ...page, ...parameters, send_to: id });
  }

  const workshopYears = new Map([
    ["/agentic-ai-workshop/", 2026],
    ["/agentic-ai-workshop-2025/", 2025],
  ]);
  const repositoryYears = new Map([
    ["agentic-ai-workshop-2026", 2026],
    ["agentic-ai-workshop-2025", 2025],
  ]);

  // The legacy homepage stops bubbling inside its article panels.
  document.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;
    let url;
    try {
      url = new URL(link.href, origin);
    } catch {
      return;
    }
    if (url.protocol === "mailto:" || url.protocol === "tel:") {
      emit("contact_open", { contact_method: url.protocol === "mailto:" ? "email" : "phone" });
      return;
    }
    if (!/^https?:$/.test(url.protocol)) return;
    if (link.hasAttribute("data-slide-download")) {
      const year = workshopYears.get(path);
      if (year) emit("resource_open", { resource_kind: "slides", course_year: year });
      return;
    }
    if (url.hostname === "github.com" && /^\/adityaarunsinghal\/agentic-ai-workshop(?:-2025|-2026)?(?:\/|$)/.test(url.pathname)) {
      const repository = url.pathname.split("/")[2];
      const year = repositoryYears.get(repository)
        || (repository === "agentic-ai-workshop" ? workshopYears.get(path) : null);
      if (year) emit("resource_open", { resource_kind: "code", course_year: year });
      return;
    }
    if (url.origin === origin && workshopYears.has(url.pathname)) {
      if (url.pathname !== path) emit("resource_open", { resource_kind: "workshop", course_year: workshopYears.get(url.pathname) });
      return;
    }
    let platform;
    if (/(^|\.)linkedin\.com$/.test(url.hostname) && url.pathname.startsWith("/in/")) platform = "linkedin";
    else if (url.hostname === "github.com" && /^\/adityaarunsinghal\/?$/.test(url.pathname)) platform = "github";
    else if (/(^|\.)x\.com$/.test(url.hostname) && /^\/dramebaazguy\/?$/.test(url.pathname)) platform = "x";
    else if (/(^|\.)instagram\.com$/.test(url.hostname) && /^\/that_dramebaaz_guy\/?$/.test(url.pathname)) platform = "instagram";
    else if (/(^|\.)facebook\.com$/.test(url.hostname) && /^\/that\.dramebaaz\.guy\/?$/.test(url.pathname)) platform = "facebook";
    else if (/(^|\.)youtube\.com$/.test(url.hostname) && /^\/@singhaladitya\/?$/.test(url.pathname)) platform = "youtube";
    if (platform) emit("social_open", { platform });
  }, true);

  for (const [type, eventName] of [["site:video-open", "video_open"], ["site:video-play", "video_play"]]) {
    const seen = new Set();
    document.addEventListener(type, (event) => {
      const videoId = event.detail?.videoId;
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId || "") || seen.has(videoId)) return;
      seen.add(videoId);
      emit(eventName, { video_id: videoId, video_context: path === "/" ? "personal" : "workshop" });
    });
  }
})();
