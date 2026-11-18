// Optional WebMCP access to this site's public workshop data.
(() => {
  "use strict";
  if (typeof document === "undefined") return;
  let context;
  try {
    context = typeof document.modelContext?.registerTool === "function" ? document.modelContext
      : typeof navigator !== "undefined" && typeof navigator.modelContext?.registerTool === "function"
        ? navigator.modelContext : null;
  } catch { return; }
  if (!context) return;
  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const failure = (code, message) => ({ ok: false, error: { code, message }, documentation: "/agents.md" });
  const cancelled = () => failure("CANCELLED", "The request was cancelled.");
  const tool = {
    name: "get_public_workshops",
    title: "Read the NYU Agentic AI workshops",
    description: "Read published course information, materials and recording chapters for 2026 and 2025. Optionally select a year. Does not register attendees.",
    inputSchema: { type: "object", properties: { year: { type: "integer", enum: [2025, 2026] } }, additionalProperties: false },
    annotations: { readOnlyHint: true, consequentialHint: false },
    async execute(value = {}, options) {
      if (!object(value) || Object.keys(value).some((key) => key !== "year")
        || (value.year !== undefined && ![2025, 2026].includes(value.year))) {
        return failure("INVALID_INPUT", "Provide an object with optional year 2025 or 2026.");
      }
      const signal = options?.signal;
      if (signal?.aborted) return cancelled();
      try {
        const response = await fetch("/api/v1/workshops.json", {
          method: "GET", credentials: "omit", headers: { Accept: "application/json" },
          ...(signal ? { signal } : {}),
        });
        if (signal?.aborted) return cancelled();
        if (!response.ok) return failure("HTTP_ERROR", "The public workshop document could not be retrieved.");
        if (!/^application\/(?:json|[\w.+-]+\+json)(?:;|$)/i.test(response.headers.get("Content-Type") || "")) {
          return failure("UNEXPECTED_RESPONSE", "The endpoint did not return JSON.");
        }
        const body = await response.text();
        if (signal?.aborted) return cancelled();
        if (body.length > 1000000) return failure("INVALID_DATA", "The workshop document exceeded the supported size.");
        const data = JSON.parse(body);
        if (!object(data) || data.apiVersion !== "1" || typeof data.sourceUrl !== "string"
          || !data.sourceUrl.startsWith("https://") || !/^\d{4}-\d{2}-\d{2}$/.test(data.modified)
          || !Array.isArray(data.workshops) || data.workshops.length > 10
          || !data.workshops.every((item) => object(item) && [2025, 2026].includes(item.year)
            && ["status", "title", "description", "modified", "url"].every((key) => typeof item[key] === "string")
            && item.url.startsWith("https://") && Array.isArray(item.recordings))) {
          return failure("INVALID_DATA", "The workshop document does not match the expected format.");
        }
        return {
          ok: true, sourceUrl: data.sourceUrl, modified: data.modified,
          workshops: data.workshops.filter((item) => value.year === undefined || item.year === value.year),
        };
      } catch {
        return signal?.aborted ? cancelled() : failure("FETCH_FAILED", "The workshop document could not be read. Use the public course pages or try again later.");
      }
    },
  };
  try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch { /* Optional browser support. */ }
})();
