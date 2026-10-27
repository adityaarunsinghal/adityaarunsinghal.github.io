// Optional WebMCP access to the same public documents linked on the website.
// Specification: https://webmachinelearning.github.io/webmcp/
(() => {
  "use strict";

  if (typeof document === "undefined") return;
  let context;
  try {
    if (typeof document.modelContext?.registerTool === "function") {
      context = document.modelContext;
    } else if (typeof navigator !== "undefined" &&
        typeof navigator.modelContext?.registerTool === "function") {
      context = navigator.modelContext;
    }
  } catch {
    return;
  }
  if (!context) return;

  const endpoints = {
    profile: "/api/v1/profile.json",
    resources: "/api/v1/resources.json",
    workshops: "/api/v1/workshops.json",
  };
  const help = "https://adityasinghal.com/developers/";
  const annotations = { readOnlyHint: true, consequentialHint: false };
  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const text = (value) => typeof value === "string";
  const normalize = (value) => value.trim().normalize("NFKC").toLowerCase();
  const httpsUrl = (value) => {
    if (!text(value)) return false;
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  };
  const error = (code, message, hint, details = {}) => ({
    ok: false, error: { code, message, hint, ...details }, documentation: help,
  });
  const invalid = (message) => error("INVALID_INPUT", message, "Use the tool's documented input fields and limits.");
  const cancelled = () => error("CANCELLED", "The request was cancelled.", "Start another request if the information is still needed.");

  function validateInput(input, fields) {
    if (input === undefined) input = {};
    if (!object(input) || Object.keys(input).some((key) => !fields.includes(key))) {
      return { failure: invalid(`Provide an object using only these fields: ${fields.join(", ") || "(none)"}.`) };
    }
    return { input };
  }

  function validEnvelope(data) {
    return object(data) && data.apiVersion === "1" && httpsUrl(data.sourceUrl) &&
      text(data.modified) && /^\d{4}-\d{2}-\d{2}$/.test(data.modified);
  }

  function validProfile(data) {
    return ["name", "alternateName", "biography", "description", "jobTitle", "employer"]
      .every((field) => text(data[field])) &&
      Array.isArray(data.topics) && data.topics.every(text) &&
      object(data.profiles) && Object.values(data.profiles).every(httpsUrl);
  }

  function validResources(data) {
    return Array.isArray(data.resources) && data.resources.length <= 1000 &&
      data.resources.every((resource) => object(resource) &&
        ["category", "name", "description"].every((field) => text(resource[field])) &&
        httpsUrl(resource.url));
  }

  function validWorkshops(data) {
    return Array.isArray(data.workshops) && data.workshops.length <= 10 &&
      data.workshops.every((workshop) => object(workshop) &&
        [2025, 2026].includes(workshop.year) &&
        ["status", "title", "description", "modified"].every((field) => text(workshop[field])) &&
        httpsUrl(workshop.url) && Array.isArray(workshop.recordings));
  }

  async function readDocument(path, validate, options) {
    const signal = options?.signal;
    if (signal?.aborted) return { failure: cancelled() };
    try {
      const response = await fetch(path, {
        method: "GET",
        credentials: "omit",
        headers: { Accept: "application/json" },
        ...(signal ? { signal } : {}),
      });
      if (signal?.aborted) return { failure: cancelled() };
      if (!response.ok) {
        return { failure: error("HTTP_ERROR", "The public document could not be retrieved.",
          "Check the documentation link and retry later if the server is unavailable.", { status: response.status }) };
      }
      const mediaType = (response.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
      if (mediaType !== "application/json" && !/^application\/[\w.+-]+\+json$/.test(mediaType)) {
        return { failure: error("UNEXPECTED_RESPONSE", "The public endpoint did not return JSON.",
          "Use the linked public documentation; the site may be updating.") };
      }
      const body = await response.text();
      if (signal?.aborted) return { failure: cancelled() };
      if (body.length > 1000000) {
        return { failure: error("INVALID_DATA", "The public document exceeded the supported size.",
          "Read the public page linked from the documentation instead.") };
      }
      let data;
      try { data = JSON.parse(body); } catch {
        return { failure: error("INVALID_DATA", "The public document is not valid JSON.",
          "Use the public documentation and retry after the site has updated.") };
      }
      if (!validEnvelope(data) || !validate(data)) {
        return { failure: error("INVALID_DATA", "The public document does not match the expected format.",
          "Check the current API description in the public documentation.") };
      }
      return { data };
    } catch {
      if (signal?.aborted) return { failure: cancelled() };
      return { failure: error("FETCH_FAILED", "The public document could not be fetched.",
        "Check the connection or use the ordinary public page.") };
    }
  }

  const tools = [
    {
      name: "get_public_profile",
      title: "Read Aditya Singhal's public profile",
      description: "Read Aditya (Adi) Singhal's published biography, work topics, and profile links. Returns only public site content; no login or credentials are needed.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations,
      async execute(value, options) {
        const checked = validateInput(value, []);
        if (checked.failure) return checked.failure;
        const result = await readDocument(endpoints.profile, validProfile, options);
        if (result.failure) return result.failure;
        return { ok: true, profile: result.data };
      },
    },
    {
      name: "find_public_resources",
      title: "Find public projects and learning resources",
      description: "Find public profile links, AI workshop materials, software projects, and technical writing linked by Aditya Singhal. Matches all query words against names, descriptions, and categories, ignoring case. Returns at most 20 resources, with source URLs and a match count.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", maxLength: 160, description: "Words to find; omit to list resources." },
          category: { type: "string", maxLength: 80, description: "An exact category label, ignoring case. Omit to search all categories. Returned categories list the available labels." },
          limit: { type: "integer", minimum: 1, maximum: 20, default: 8, description: "Maximum number of matching resources to return." },
        },
        additionalProperties: false,
      },
      annotations,
      async execute(value, options) {
        const checked = validateInput(value, ["query", "category", "limit"]);
        if (checked.failure) return checked.failure;
        const { query = "", category = "", limit = 8 } = checked.input;
        if (!text(query) || query.length > 160 || !text(category) || category.length > 80 ||
            !Number.isInteger(limit) || limit < 1 || limit > 20) {
          return invalid("Use a query up to 160 characters, a category up to 80 characters, and an integer limit from 1 to 20.");
        }
        const result = await readDocument(endpoints.resources, validResources, options);
        if (result.failure) return result.failure;
        const data = result.data;
        const categories = [...new Set(data.resources.map((resource) => resource.category))];
        const selected = normalize(category);
        if (selected && !categories.some((label) => normalize(label) === selected)) {
          return { ...invalid("The category is not in the public resource catalog."), categories };
        }
        const terms = normalize(query).split(/\s+/).filter(Boolean);
        const matches = data.resources.filter((resource) => {
          if (selected && normalize(resource.category) !== selected) return false;
          const searchable = normalize(`${resource.category} ${resource.name} ${resource.description}`);
          return terms.every((term) => searchable.includes(term));
        });
        return {
          ok: true, sourceUrl: data.sourceUrl, modified: data.modified,
          query: query.trim(), category: category.trim() || null, categories,
          total: matches.length, truncated: matches.length > limit,
          resources: matches.slice(0, limit),
        };
      },
    },
    {
      name: "get_public_workshops",
      title: "Read Aditya Singhal's public AI workshops",
      description: "Read published information, available materials, and recording chapters for Aditya Singhal's 2026 NYU Agentic AI workshop and 2025 archive. Optionally select a year. This reads public course information and does not register attendees.",
      inputSchema: {
        type: "object",
        properties: { year: { type: "integer", enum: [2025, 2026], description: "Omit to read both years." } },
        additionalProperties: false,
      },
      annotations,
      async execute(value, options) {
        const checked = validateInput(value, ["year"]);
        if (checked.failure) return checked.failure;
        const { year } = checked.input;
        if (year !== undefined && ![2025, 2026].includes(year)) return invalid("The supported workshop years are 2025 and 2026.");
        const result = await readDocument(endpoints.workshops, validWorkshops, options);
        if (result.failure) return result.failure;
        const data = result.data;
        return {
          ok: true, sourceUrl: data.sourceUrl, modified: data.modified,
          workshops: data.workshops.filter((workshop) => year === undefined || workshop.year === year),
        };
      },
    },
  ];

  for (const tool of tools) {
    try {
      // Current registrations are promises; earlier implementations returned void.
      // A disabled experiment or rejected registration must not affect browsing.
      Promise.resolve(context.registerTool(tool)).catch(() => {});
    } catch {
      // Some preview implementations throw synchronously instead.
    }
  }
})();
