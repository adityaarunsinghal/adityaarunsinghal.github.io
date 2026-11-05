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
  discoveryUrl: `${origin}/.well-known/poppy.json`,
  mcpUrl: `${origin}/mcp`,
  conversationsUrl: `${origin}/conversations`,
  issuerUrl: "https://auth-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com",
} as const;

export function assistantConnectionMarkdown(websiteUrl: string): string {
  return `## Ask Adi's assistant

Website: ${websiteUrl}

Public questions can be asked without a browser or customer sign-in.

- Connection instructions: ${websiteAssistant.instructionsUrl}
- Guest HTTP API: ${websiteAssistant.publicApiUrl}
- API contract: ${websiteAssistant.openApiUrl}
- PAP discovery: ${websiteAssistant.discoveryUrl}

Use the guest HTTP API when your client does not support PAP. A PAP client signs a fresh Poppy-Session proof for each request using its own published identity. A missing proof is not a request to sign in as the website owner.
`;
}
