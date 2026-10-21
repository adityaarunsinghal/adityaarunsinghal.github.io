export const site = {
  origin: "https://adityasinghal.com",
  name: "Aditya Singhal",
  alternateName: "Adi Singhal",
  title: "Aditya Singhal | Agentic AI, MCP & Applied Science",
  headline: "I build and evaluate production AI agents.",
  biography:
    "I'm Adi, an Applied Scientist at Amazon and a former AWS Bedrock engineer. I work on agentic AI, Model Context Protocol (MCP), and RAG systems, and teach agentic AI at NYU.",
  description:
    "Aditya (Adi) Singhal builds and evaluates AI agents with MCP. Applied Scientist at Amazon, former AWS Bedrock engineer, and agentic AI instructor at NYU.",
  jobTitle: "Applied Scientist",
  employer: "Amazon",
  modified: "2026-10-21",
  googleVerification: "Mu_M8rG9SHTJdAcpshMu76G6x_EwaOQaznwBRGdMSeI",
  portrait: "/static/images/adi-mcp-2026.webp",
  socialImage: "/social/adi-singhal.png",
} as const;

export const profileLinks = {
  linkedin: "https://www.linkedin.com/in/adi-singhal/",
  github: "https://github.com/adityaarunsinghal",
  x: "https://x.com/dramebaazguy",
  youtube: "https://www.youtube.com/@singhaladitya",
  instagram: "https://www.instagram.com/that_dramebaaz_guy/",
  facebook: "https://www.facebook.com/that.dramebaaz.guy",
} as const;

export const readingMap = [
  {
    heading: "Profile",
    links: [
      { name: "Personal website", url: `${site.origin}/`, description: "Introduction, selected work, writing, and contact links." },
      { name: "LinkedIn", url: profileLinks.linkedin, description: "Professional profile and published writing." },
      { name: "GitHub", url: profileLinks.github, description: "Public repositories." },
      { name: "X", url: profileLinks.x, description: "Adi's profile as @dramebaazguy." },
      { name: "YouTube", url: profileLinks.youtube, description: "Films and conversations." },
    ],
  },
  {
    heading: "Agentic AI and MCP teaching",
    links: [
      { name: "NYU Agentic AI Workshop 2026", url: `${site.origin}/agentic-ai-workshop/`, description: "Agent harnesses, tools and MCP, interfaces beyond chat, multi-agent systems, and evaluation. Taught with Luca Chang." },
      { name: "2026 workshop code and materials", url: "https://github.com/adityaarunsinghal/agentic-ai-workshop-2026", description: "Released lessons, slides, and runnable examples." },
      { name: "NYU Agentic AI Workshop 2025 archive", url: `${site.origin}/agentic-ai-workshop-2025/`, description: "The earlier course, session recordings, chapters, and public code." },
    ],
  },
  {
    heading: "Public projects",
    links: [
      { name: "LLM-as-a-Judge Prompt Improver", url: "https://github.com/adityaarunsinghal/LLM-As-A-Judge-Prompt-Improver", description: "Prompt evaluation and improvement using scoring, cross-validation, error analysis, and an iterative optimization loop." },
      { name: "cc-hindsight", url: "https://github.com/adityaarunsinghal/cc-hindsight", description: "Turns coding-agent session history into reusable prompts and preference files." },
    ],
  },
  {
    heading: "Technical writing",
    links: [
      { name: "Why 'Code Mode' is like Shaking a Tree", url: "https://www.linkedin.com/pulse/why-code-mode-like-shaking-tree-aditya-singhal-gkzae", description: "August 21, 2026. Coauthored with Patrick Kelly; explains programmatic tool use and intermediate data handling. Port of Context's benchmarks in the article are attributed to that team." },
      { name: "What I learnt about the new MCP 2.0 release today at the NY Release Event", url: "https://www.linkedin.com/pulse/what-i-learnt-new-mcp-20-release-today-ny-event-aditya-singhal-7vupe", description: "July 29, 2026. Notes from the MCP release event on protocol changes and their implications for agent builders." },
    ],
  },
] as const;
