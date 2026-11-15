/** Public connection details for the Ambipath-hosted website assistant. */
const origin = "https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com";
const deploymentId = "a6436a43-e728-456d-879c-c7674b0d814f";
const publicApiUrl = `https://console.ambipath.com/api/v1/public/${deploymentId}`;

export const websiteAssistant = {
  name: "Adi's website assistant",
  catalogIdentifier: "urn:air:adityasinghal.com:agent:website-assistant",
  instructionsIdentifier: "urn:air:adityasinghal.com:agent:guest-instructions",
  deploymentId,
  publicApiUrl,
  instructionsUrl: `${publicApiUrl}/agent.md`,
  openApiUrl: "https://console.ambipath.com/api/public-openapi.json",
  origin,
  discoveryUrl: "https://adityasinghal.com/.well-known/poppy.json",
  mcpUrl: `${origin}/mcp`,
  conversationsUrl: `${origin}/conversations`,
  issuerUrl: "https://auth-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com",
} as const;

export function assistantConnectionMarkdown(websiteUrl: string): string {
  return `## Ask Adi's assistant

Website: ${websiteUrl}

Ask through [Poppy discovery on this website](${websiteAssistant.discoveryUrl}). Public questions do not require a customer account or owner sign-in. A compatible client uses its own signed Poppy session.

If your client cannot use Poppy, follow the [guest HTTP connection instructions](${websiteAssistant.instructionsUrl}) and [API contract](${websiteAssistant.openApiUrl}). Send a question once, await its answer, and close completed test conversations. Keep conversation credentials private.
`;
}
