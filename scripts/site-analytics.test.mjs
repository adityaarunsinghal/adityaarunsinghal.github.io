import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const code = readFileSync(new URL("../public/site-analytics.js", import.meta.url), "utf8");
const origin = "https://adityasinghal.com";
const workshopOrigin = "https://learningwithagents.com";

function page(options = {}) {
  const listeners = new Map();
  const scripts = [];
  class Element {
    constructor(href, slides = false) { this.href = href; this.slides = slides; }
    closest() { return this; }
    hasAttribute(name) { return name === "data-slide-download" && this.slides; }
  }
  const location = { origin, pathname: "/", search: "?private=email@example.com", ...options.location };
  const window = { location };
  const document = {
    title: "Aditya Singhal",
    referrer: "https://example.com/private?email=person@example.com",
    currentScript: { dataset: { measurementId: options.id ?? "G-TEST123456" } },
    querySelector: (selector) => selector.includes("canonical")
      ? { href: options.canonical ?? origin + "/" } : { content: options.robots ?? "index, follow" },
    getElementById: () => options.appRoot ? {} : null,
    createElement: () => ({}),
    head: { append: (script) => scripts.push(script) },
    addEventListener: (type, handler) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
  };
  const context = vm.createContext({ window, document, URL, Element });
  vm.runInContext(code, context);
  const calls = () => JSON.parse(JSON.stringify((window.dataLayer || []).map((call) => Array.from(call))));
  const events = () => calls().filter(([command]) => command === "event");
  const dispatch = (type, event) => (listeners.get(type) || []).forEach((handler) => handler(event));
  return {
    calls, events, scripts, rerun: () => vm.runInContext(code, context),
    click: (href, options = {}) => dispatch("click", {
      button: 0, target: new Element(href, options.slides), ...options,
    }),
    video: (type, videoId) => dispatch(type, { detail: { videoId } }),
  };
}

test("public tracking refuses disabled IDs, app routes, noindex pages, previews and redirecting legacy bookmarks", () => {
  for (const options of [
    { id: "" }, { id: "UA-OLD" }, { robots: "noindex, follow" }, { appRoot: true },
    { location: { origin: "http://127.0.0.1:4182" } },
    { location: { origin: "https://www.learningwithagents.com" } },
    { location: { origin: "https://learningwithagents.com.evil.example" } },
    { location: { origin: "http://learningwithagents.com" } },
    { location: { pathname: "/progress/" } },
    { location: { search: "?/progress&private=value" } },
    { location: { pathname: "/index.html" } },
    { location: { pathname: "/2026/" } },
    { location: { origin: workshopOrigin, pathname: "/static/" } },
    { location: { origin: workshopOrigin, pathname: "/2026/registration-form/" } },
    { location: { origin: workshopOrigin, pathname: "/agentic-ai-workshop/feedback/" } },
  ]) {
    const result = page(options);
    assert.equal(result.scripts.length, 0);
    assert.equal(result.events().length, 0);
  }
});

test("serving host and normalized route determine page location independently of SEO canonical", () => {
  for (const [servingOrigin, pathname, expectedPath] of [
    [origin, "/agentic-ai-workshop/", "/agentic-ai-workshop/"],
    [origin, "/agentic-ai-workshop-2026/", "/agentic-ai-workshop-2026/"],
    [origin, "/static/", "/"],
    [workshopOrigin, "/", "/"],
    [workshopOrigin, "/2026", "/2026/"],
    [workshopOrigin, "/2025/", "/2025/"],
    [workshopOrigin, "/agentic-ai-workshop/", "/agentic-ai-workshop/"],
    [workshopOrigin, "/agentic-ai-workshop-2026/", "/agentic-ai-workshop-2026/"],
    [workshopOrigin, "/agentic-ai-workshop-2025/", "/agentic-ai-workshop-2025/"],
  ]) {
    for (const canonical of [workshopOrigin + "/2026/", origin + "/agentic-ai-workshop/", "invalid canonical?private=secret"]) {
      const result = page({
        canonical,
        location: { origin: servingOrigin, pathname, search: "?recording=private&t=42", hash: "#private-search" },
      });
      assert.equal(result.scripts.length, 1, `${servingOrigin}${pathname}`);
      assert.equal(result.events()[0][2].page_location, servingOrigin + expectedPath);
      assert.ok(!JSON.stringify(result.calls()).includes("private"));
    }
  }
});

test("one manual pageview strips query/hash and referrer path; repeated execution stays idempotent", () => {
  const result = page({ location: { hash: "#private-name" } });
  result.rerun();
  assert.equal(result.scripts.length, 1);
  assert.equal(result.events().length, 1);
  const [, event, payload] = result.events()[0];
  assert.equal(event, "page_view");
  assert.equal(payload.page_location, origin + "/");
  assert.equal(payload.page_referrer, "https://example.com/");
  assert.equal(result.calls().find(([command]) => command === "config")[2].send_page_view, false);
  assert.ok(!JSON.stringify(result.calls()).includes("person@example.com"));
  assert.ok(!JSON.stringify(result.calls()).includes("private-name"));
});

test("resource, contact and profile actions emit one bounded event without outbound URL or email", () => {
  const result = page();
  result.click("https://github.com/adityaarunsinghal/agentic-ai-workshop-2026?private=secret");
  result.click("mailto:adi@example.com?body=private");
  result.click("https://www.linkedin.com/in/adi-singhal/?private=secret");
  result.click("https://github.com/adityaarunsinghal/agentic-ai-workshop-2026", { ctrlKey: true });
  assert.deepEqual(result.events().slice(1).map(([, name]) => name), ["resource_open", "contact_open", "social_open"]);
  assert.equal(result.events()[1][2].resource_kind, "code");
  assert.equal(result.events()[2][2].contact_method, "email");
  assert.equal(result.events()[3][2].platform, "linkedin");
  const serialized = JSON.stringify(result.calls());
  for (const privateValue of ["adi@example.com", "secret", "private", "external.example"]) {
    assert.ok(!serialized.includes(privateValue), privateValue);
  }
});

test("archive legacy code links and year-specific repositories retain the correct resource year", () => {
  const archive = page({
    canonical: origin + "/agentic-ai-workshop-2025/",
    location: { pathname: "/agentic-ai-workshop-2025/" },
  });
  archive.click("https://github.com/adityaarunsinghal/agentic-ai-workshop");
  archive.click("https://github.com/adityaarunsinghal/agentic-ai-workshop-2026/tree/main");
  archive.click("https://external.example/session.html?private=secret", { slides: true });
  assert.deepEqual(archive.events().slice(1).map(([, , payload]) => [payload.resource_kind, payload.course_year]), [
    ["code", 2025], ["code", 2026], ["slides", 2025],
  ]);
  const home = page();
  home.click("https://github.com/adityaarunsinghal/agentic-ai-workshop-2025");
  home.click("https://github.com/adityaarunsinghal/agentic-ai-workshop-2026");
  home.click("https://github.com/adityaarunsinghal/agentic-ai-workshop");
  assert.deepEqual(home.events().slice(1).map(([, , payload]) => payload.course_year), [2025, 2026]);
});

test("video tracking distinguishes player opening from real play and emits each once", () => {
  const result = page();
  result.video("site:video-open", "Gaa14VT4eWI");
  result.video("site:video-open", "Gaa14VT4eWI");
  result.video("site:video-play", "Gaa14VT4eWI");
  result.video("site:video-play", "private email@example.com");
  assert.deepEqual(result.events().slice(1).map(([, name]) => name), ["video_open", "video_play"]);
  assert.equal(result.events()[1][2].video_context, "personal");
});

test("dedicated root and local year routes retain workshop context and bounded resource events", () => {
  for (const [pathname, year] of [["/", 2026], ["/2026/", 2026], ["/2025/", 2025]]) {
    const result = page({ location: { origin: workshopOrigin, pathname } });
    result.video("site:video-open", "Gaa14VT4eWI");
    result.video("site:video-play", "Gaa14VT4eWI");
    result.click("https://external.example/slides?private=secret", { slides: true });
    result.click("https://github.com/adityaarunsinghal/agentic-ai-workshop");
    const nextYear = year === 2026 ? 2025 : 2026;
    result.click(`${workshopOrigin}/${nextYear}/?private=secret#private`);
    assert.deepEqual(result.events().slice(1).map(([, name]) => name),
      ["video_open", "video_play", "resource_open", "resource_open", "resource_open"]);
    assert.equal(result.events()[1][2].video_context, "workshop");
    assert.equal(result.events()[2][2].video_context, "workshop");
    assert.deepEqual(result.events().slice(3).map(([, , payload]) => [payload.resource_kind, payload.course_year]),
      [["slides", year], ["code", year], ["workshop", nextYear]]);
    assert.ok(!JSON.stringify(result.calls()).includes("private"));
  }
});
