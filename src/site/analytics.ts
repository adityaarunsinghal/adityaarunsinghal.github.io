// Use a verified public GA4 web-stream ID and disable Enhanced measurement in
// that stream before enabling these deliberately bounded public-page events.
export const analytics = {
  enabled: true,
  measurementId: "G-CSRQLVW2TG",
} as const;

export function analyticsMeasurementId(): string | null {
  if (!analytics.enabled) return null;
  if (!/^G-[A-Z0-9]+$/.test(analytics.measurementId)) {
    throw new Error("Public analytics needs a verified GA4 measurement ID.");
  }
  return analytics.measurementId;
}

export function analyticsHead(): string {
  const id = analyticsMeasurementId();
  return id
    ? `<script src="/site-analytics.js" data-measurement-id="${id}" defer></script>`
    : "";
}
