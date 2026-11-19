import { site } from "../content";

/**
 * Public values supplied by the Ambipath console's setup payload (setup skill v0.2.0).
 * Copy fresh values from Agent → Installation; never put a setup code here.
 */
const origin = "https://adi-singhal.agents.ambipath.com";
const deploymentId = "2a1f524e-434f-4e9a-b275-e608270d07a6";
const publicApiUrl = `${origin}/api/v1/public`;
const siteProof = "ydI41Nec88PgwIUGTun1zcpUwmpVbft83EGmfqaSp3g";

export const websiteAssistant = {
  name: "Adi's Website",
  catalogIdentifier: `urn:air:adityasinghal.com:agent:${deploymentId}`,
  mcpIdentifier: `urn:air:adityasinghal.com:agent:${deploymentId}:mcp`,
  instructionsIdentifier: "urn:air:adityasinghal.com:agent:guest-instructions",
  deploymentId,
  publicApiUrl,
  instructionsUrl: `${publicApiUrl}/agent.md`,
  openApiUrl: `${origin}/api/public-openapi.json`,
  origin,
  discoveryUrl: `${site.origin}/.well-known/poppy.json`,
  mcpUrl: `${origin}/mcp`,
  mcpServerCardUrl: `${origin}/mcp/server-card`,
  conversationsUrl: `${origin}/conversations`,
  loaderUrl: `${origin}/widget/loader.js`,
} as const;

/**
 * The supplied installation snippet plus the verification meta tag (v0.2.0 asks for both proof methods).
 * The snippet's rel="ard" link is omitted here because every head already links /.well-known/ard.json.
 */
export const ambipathHead = `<meta name="ambipath-site-verification" content="${siteProof}">
<link rel="service-desc" type="application/json" href="${websiteAssistant.discoveryUrl}">
<link rel="service-doc" type="text/markdown" href="${websiteAssistant.instructionsUrl}">
<script src="${websiteAssistant.loaderUrl}" data-ambipath="${deploymentId}" defer></script>`;

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
    description: "Ask about approved information, policies and customer requests.",
  }],
});

/** A real 404 for oauth-protected-resource means no customer sign-in is advertised. */
export const ambipathFiles: Record<string, unknown> = {
  "/.well-known/ambipath.json": { deployment: deploymentId, proof: siteProof },
  "/.well-known/poppy.json": { ...poppy("1.0"), supported_versions: { "0.4": `${site.origin}/.well-known/poppy-0.4.json` } },
  "/.well-known/poppy-0.4.json": poppy("0.4"),
};

const representativeQueries = [
  "What can you help me with?",
  "What information and policies can you explain?",
  "How can I contact the team?",
];

/** Supplied Poppy and MCP Server Card entries, merged by identifier into the site's ARD directory. */
export const ambipathArdEntries = [
  {
    identifier: websiteAssistant.catalogIdentifier,
    displayName: websiteAssistant.name,
    description: "Ask public questions through the Personal Agent Protocol or the linked guest API.",
    type: "application/poppy+json",
    url: websiteAssistant.discoveryUrl,
    representativeQueries,
  },
  {
    identifier: websiteAssistant.mcpIdentifier,
    displayName: websiteAssistant.name,
    description: "Ask Adi's Website public questions using MCP.",
    type: "application/mcp-server-card+json",
    url: websiteAssistant.mcpServerCardUrl,
    representativeQueries,
  },
];

export function assistantConnectionMarkdown(websiteUrl: string): string {
  return `## Ask Adi's assistant

Website: ${websiteUrl}

Ask through [Poppy discovery on this website](${websiteAssistant.discoveryUrl}) (Personal Agent Protocol 1.0). Public questions do not require a customer account or owner sign-in. A compatible client uses its own signed Poppy session. Ambipath hosts the assistant; this website publishes its discovery files.

- [MCP Server Card](${websiteAssistant.mcpServerCardUrl}): for MCP clients.
- [Guest HTTP API](${websiteAssistant.publicApiUrl}): for clients that cannot sign a fresh Poppy-Session proof.

If your client cannot use Poppy, follow the [guest HTTP connection instructions](${websiteAssistant.instructionsUrl}) and [API contract](${websiteAssistant.openApiUrl}). Send a question once, await its answer, and close completed test conversations. Keep conversation credentials private. Never sign in as the website owner to ask a public question.
`;
}
