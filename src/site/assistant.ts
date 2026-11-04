/** Public connection details for the Ambipath-hosted website assistant. */
const origin = "https://assistant-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com";

export const websiteAssistant = {
  name: "Adi's website assistant",
  catalogIdentifier: "urn:air:adityasinghal.com:agent:website-assistant",
  origin,
  discoveryUrl: `${origin}/.well-known/poppy.json`,
  mcpUrl: `${origin}/mcp`,
  conversationsUrl: `${origin}/conversations`,
  issuerUrl: "https://auth-5fb03649c9914801a952129b908a3ac9.agents.ambipath.com",
} as const;
