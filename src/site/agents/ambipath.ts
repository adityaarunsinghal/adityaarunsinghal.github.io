import { site } from "../content";

/**
 * Public values supplied by the Ambipath console's setup payload.
 * Copy fresh values from Agent → Installation; never put a setup code here.
 */
const origin = "https://assistant-d25001ed19e24376a95fc870b8da0769.agents.ambipath.com";
const deploymentId = "2a1f524e-434f-4e9a-b275-e608270d07a6";
const publicApiUrl = `https://console.ambipath.com/api/v1/public/${deploymentId}`;

export const websiteAssistant = {
  name: "Adi's Website",
  catalogIdentifier: "urn:air:adityasinghal.com:agent:d25001ed-19e2-4376-a95f-c870b8da0769",
  instructionsIdentifier: "urn:air:adityasinghal.com:agent:guest-instructions",
  deploymentId,
  publicApiUrl,
  instructionsUrl: `${publicApiUrl}/agent.md`,
  openApiUrl: "https://console.ambipath.com/api/public-openapi.json",
  origin,
  discoveryUrl: `${site.origin}/.well-known/poppy.json`,
  mcpUrl: `${origin}/mcp`,
  conversationsUrl: `${origin}/conversations`,
} as const;

/** The exact installation snippet supplied by Ambipath. */
export const ambipathHead = `<link rel="service-desc" type="application/json" href="${origin}/.well-known/poppy.json">
<link rel="service-doc" type="text/markdown" href="${websiteAssistant.instructionsUrl}">
<script src="https://console.ambipath.com/widget/loader.js" data-ambipath="${deploymentId}" defer></script>`;

const poppy = (version: string) => ({
  protocol_version: version,
  organization: { name: "Adi's Website", domain: "adityasinghal.com" },
  agent: {
    protocols: [{
      type: "poppy",
      endpoint: websiteAssistant.conversationsUrl,
      description: "Ask about this organization, its approved information, policies and how to reach the team.",
      access: "session",
    }],
  },
  apis: [{
    type: "mcp",
    url: websiteAssistant.mcpUrl,
    description: "Ask the brand about approved product information, policies and your customer requests.",
  }],
});

/** A real 404 for oauth-protected-resource means no customer sign-in is advertised. */
export const ambipathFiles: Record<string, unknown> = {
  "/.well-known/ambipath.json": { deployment: deploymentId, proof: "ydI41Nec88PgwIUGTun1zcpUwmpVbft83EGmfqaSp3g" },
  "/.well-known/poppy.json": { ...poppy("1.0"), supported_versions: { "0.4": `${site.origin}/.well-known/poppy-0.4.json` } },
  "/.well-known/poppy-0.4.json": poppy("0.4"),
};

export const ambipathArdEntry = {
  identifier: websiteAssistant.catalogIdentifier,
  displayName: websiteAssistant.name,
  description: "Poppy discovery on this website for Adi's assistant. Use a compatible signed-session client, or the guest HTTP API fallback.",
  type: "application/json",
  url: websiteAssistant.discoveryUrl,
  representativeQueries: [
    "Ask Adi's assistant about his work, projects or teaching",
    "How can I reach Aditya Singhal?",
  ],
};

export function assistantConnectionMarkdown(websiteUrl: string): string {
  return `## Ask Adi's assistant

Website: ${websiteUrl}

Ask through [Poppy discovery on this website](${websiteAssistant.discoveryUrl}). Public questions do not require a customer account or owner sign-in. A compatible client uses its own signed Poppy session.

If your client cannot use Poppy, follow the [guest HTTP connection instructions](${websiteAssistant.instructionsUrl}) and [API contract](${websiteAssistant.openApiUrl}). Send a question once, await its answer, and close completed test conversations. Keep conversation credentials private.
`;
}
