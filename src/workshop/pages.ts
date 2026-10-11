export type CourseState =
  "registration-open" | "registration-closed" | "in-progress" | "complete";

export const course = {
  // Change deliberately with the form owner. A visitor's clock cannot establish acceptance.
  state: "registration-open" as CourseState,
  year: 2026,
  path: "/agentic-ai-workshop/",
  archivePath: "/agentic-ai-workshop-2025/",
  appStoreUrl: "https://nyu-workshop.adityasinghal.com/",
  publicRepositoryUrl:
    "https://github.com/adityaarunsinghal/agentic-ai-workshop-2026",
  registrationUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSd_lhxUjjw0NMCvsf5qojymmS8Wur0tA26rqOnSCZarhkV31g/viewform",
  deadline: "Monday, October 5 at 5 PM ET",
  dates: "October 8, 15, 22 & 29, 2026",
  time: "Thursdays, 5:30–7:00 PM ET",
  venue: "CDS 7th Floor Open Space",
  address: "60 5th Ave, between 12th and 13th Streets",
  contact: "tb116@nyu.edu",
  modified: "2026-09-27",
};

export const historical = {
  playlist:
    "https://www.youtube.com/playlist?list=PLgF7i4LH-YxYvhXK-yywN7eFRjRjQrq89",
  repository: "https://github.com/adityaarunsinghal/agentic-ai-workshop-2025",
  feedback: "https://forms.gle/CbqwHw1mtBcL7hHZ7",
  registration:
    "https://docs.google.com/forms/d/e/1FAIpQLSe2V4WGW1P2sNSJ06s_ydU16H7LF6vcP0tYkTopYuhUyO3XjQ/viewform",
  clips: [
    {
      title: "The restaurant analogy",
      description: "A familiar way into the roles behind MCP.",
      url: "https://www.youtube.com/watch?v=LoTpDu_rSHE",
    },
    {
      title: "Agents beyond chat",
      description: "See how an agent can fit into a different interface.",
      url: "https://www.youtube.com/watch?v=VCDpMWg78iw",
    },
    {
      title: "When to split the work",
      description: "Explore the decision to use multiple agents.",
      url: "https://www.youtube.com/watch?v=U5BMtOLvcTI",
    },
  ],
};

export const instructors = [
  {
    id: "adi",
    name: "Adi Singhal",
    biography:
      "Applied Scientist at Amazon, former AWS Bedrock engineer, Ambassador at the Agentic AI Foundation (AAIF) and Instructor at NYU. At NYU, he studied psychology and data science, conducted research with faculty, and founded and led the Data Science Club to 1k members.",
    linkedin: "https://www.linkedin.com/in/adi-singhal/",
    wave: "/workshops/2026/instructors/adi-wave-2026-10-09.gif",
    still: "/workshops/2026/instructors/adi-wave-2026-10-09.jpg",
    height: 384,
  },
  {
    id: "luca",
    name: "Luca Chang",
    biography:
      "Works in the AWS Agentic AI organization and is an MCP specification maintainer and SDK contributor. Expert in building production-ready agentic systems.",
    linkedin: "https://www.linkedin.com/in/luca-chang/",
    wave: "/workshops/2026/instructors/luca-wave-2026-10-09.gif",
    still: "/workshops/2026/instructors/luca-wave-2026-10-09.jpg",
    height: 360,
  },
];

export const sessions = [
  {
    day: "08",
    date: "2026-10-08",
    title: "Agents and harnesses",
    description:
      "What an agent is, when to use one, and the machinery that runs its tools, context, and decisions.",
    topics: ["Agent loops", "Tools & MCP", "Harnesses"],
    attendance: "Required",
  },
  {
    day: "15",
    date: "2026-10-15",
    title: "Agents beyond chat",
    description:
      "Give an agent an interactive surface. Explore generated interfaces, typed decisions, and experiments with feedback.",
    topics: ["A2UI & MCP Apps", "Jev", "Auto-Research"],
    attendance: "Required",
  },
  {
    day: "22",
    date: "2026-10-22",
    title: "Multi-agent systems",
    description:
      "Decide when to divide work, what each agent needs to know, and how to coordinate handoffs and review.",
    topics: ["Context management", "Coordination protocols", "Evaluation"],
    attendance: "Required",
  },
  {
    day: "29",
    date: "2026-10-29",
    title: "Demo Day",
    description:
      "Show what you built. Discuss your project with classmates and industry guests, and learn from their questions.",
    topics: ["Student demos", "Industry feedback", "Coffee chats"],
    attendance: "Highly encouraged",
  },
];

export type RecordingChapter = {
  startSeconds: number;
  title: string;
};

export type SessionRecording = {
  id: string;
  session: number;
  date: string;
  title: string;
  youtubeId: string | null;
  durationSeconds: number;
  searchPlaceholder: string;
  chapters: RecordingChapter[];
};

export const sessionRecordings: SessionRecording[] = [
  {
    id: "session-1-recording",
    session: 1,
    date: "2026-10-08",
    title: "Models, Tools & Agent Harnesses",
    // Set this to the final YouTube video's ID after the upload is available.
    youtubeId: null,
    durationSeconds: 7352.321,
    searchPlaceholder: "Try “caching” or “homework”",
    // These match the prepared YouTube description on the untrimmed Session 1 timeline.
    chapters: [
      { startSeconds: 0, title: "Welcome and workshop format" },
      { startSeconds: 182, title: "Instructor introduction" },
      { startSeconds: 435, title: "Tools, inference and the goals for Session 1" },
      { startSeconds: 543, title: "Student project ideas and Demo Day" },
      { startSeconds: 1036, title: "From chat and tool use to personal agents" },
      { startSeconds: 1327, title: "The restaurant video" },
      { startSeconds: 1408, title: "Lalima, Harry and Tim: model, harness and tools" },
      { startSeconds: 1852, title: "Spotting the mistake in the analogy" },
      { startSeconds: 2105, title: "Live demo: asking an agent for the time" },
      { startSeconds: 2487, title: "Inspecting the request payload" },
      { startSeconds: 2675, title: "Streaming responses and tool execution" },
      { startSeconds: 2839, title: "Q&A: streaming and inference providers" },
      { startSeconds: 3036, title: "Visible reasoning and model decisions" },
      { startSeconds: 3250, title: "Who manages conversation history?" },
      { startSeconds: 3391, title: "Prompt caching and repeated context" },
      { startSeconds: 3720, title: "System prompts and instruction priority" },
      { startSeconds: 3940, title: "Eight dimensions of an agent" },
      { startSeconds: 3971, title: "Control: fixed steps or adaptive choices" },
      { startSeconds: 4029, title: "Trigger: a person, schedule or event" },
      { startSeconds: 4311, title: "Authority: acting or asking for approval" },
      { startSeconds: 4425, title: "Duration: one task or an ongoing responsibility" },
      { startSeconds: 4557, title: "Environment: tools and browsers" },
      { startSeconds: 4585, title: "Topology: one agent or an orchestrator" },
      { startSeconds: 4665, title: "Memory across interactions" },
      { startSeconds: 4720, title: "Interface beyond chat" },
      { startSeconds: 4778, title: "The small Python harness and starter code" },
      { startSeconds: 4843, title: "Class app store walkthrough" },
      { startSeconds: 4899, title: "Homework: build an agent with a custom tool" },
      { startSeconds: 5122, title: "Launching apps and visitor-funded inference" },
      { startSeconds: 5226, title: "Exploring the harness dimensions in the demo" },
      { startSeconds: 5362, title: "Demo Day and coffee chats" },
      { startSeconds: 5408, title: "Packaging, publishing and feedback" },
      { startSeconds: 5704, title: "Open Q&A" },
      { startSeconds: 5761, title: "Prompt caching versus memory and handoffs" },
      { startSeconds: 5836, title: "Choosing designs and evaluating performance" },
      { startSeconds: 6136, title: "Last year's workshop and alternative harnesses" },
      { startSeconds: 6261, title: "External tools and MCP servers" },
      { startSeconds: 6372, title: "Building an application versus using a coding agent" },
      { startSeconds: 6551, title: "Can the harness call tools directly?" },
      { startSeconds: 6780, title: "Where LangGraph fits" },
      { startSeconds: 6841, title: "When a conventional pipeline may be enough" },
      { startSeconds: 6956, title: "Model behavior, safety and harness controls" },
      { startSeconds: 7244, title: "Keeping up with agentic AI" },
    ],
  },
];

// Chapter wording and times come from the supplied YouTube descriptions,
// ordered chronologically. Dates follow the archived 2025 course schedule.
export const historicalRecordings: SessionRecording[] = [
  {
    id: "session-1-recording",
    session: 1,
    date: "2025-10-01",
    title: "Introduction to MCP & Tool Use",
    youtubeId: "jNj2PI5A6zQ",
    durationSeconds: 6631,
    searchPlaceholder: "Try “restaurant” or “homework”",
    chapters: [
      { startSeconds: 0, title: "Welcome and introductions" },
      { startSeconds: 735, title: "Workshop overview and instructor background" },
      { startSeconds: 800, title: 'From "I have a Shih Tzu" (2021) to Agentic AI (2024)' },
      { startSeconds: 980, title: "Participant survey results and expectations" },
      { startSeconds: 1260, title: "What is Agentic AI? The perception-action loop explained" },
      { startSeconds: 1430, title: "ChatGPT breakthrough moment (Dec 2022)" },
      { startSeconds: 1470, title: "GPT-4 with vision capabilities (Mar 2023)" },
      { startSeconds: 1500, title: "Tool use emerges: Claude introduces structured tools (May 2024)" },
      { startSeconds: 1530, title: "The integration nightmare before MCP" },
      { startSeconds: 1680, title: "First tool demonstration: Getting current time" },
      { startSeconds: 1770, title: "Why do we need schemas? Bridging LLMs and code" },
      { startSeconds: 1920, title: "The breakthrough moment: MCP as universal standard" },
      { startSeconds: 2100, title: "Live demo: Building a weather tool with MCP" },
      { startSeconds: 2280, title: "Understanding MCP architecture through restaurants" },
      { startSeconds: 2580, title: "Setting up MCP tools in VS Code" },
      { startSeconds: 2820, title: "Brave Search integration demo" },
      { startSeconds: 2940, title: "Real-time tool calling with Claude" },
      { startSeconds: 3030, title: "Host (Application) = Restaurant Manager" },
      { startSeconds: 3060, title: "LLM = Head Chef (makes decisions)" },
      { startSeconds: 3090, title: "MCP Server = Kitchen (provides tools)" },
      { startSeconds: 3120, title: "MCP Client = Waiter (facilitates communication)" },
      { startSeconds: 3210, title: "Walking through the complete analogy" },
      { startSeconds: 3360, title: "Project overview: Personalized newspaper agent" },
      { startSeconds: 3600, title: 'Use Case: "Fit or Flaw"' },
      { startSeconds: 4020, title: "Project vision and requirements" },
      { startSeconds: 4050, title: "Personalized news aggregation use case" },
      { startSeconds: 4140, title: "Live coding: Creating MCP tools with FastMCP" },
      { startSeconds: 4440, title: "The importance of discoverability in tool design" },
      { startSeconds: 4500, title: "Testing the agent with real news sources" },
      { startSeconds: 4620, title: "Tool composition: From 40+ calls to 5 calls" },
      { startSeconds: 4800, title: "Homework assignment overview" },
      { startSeconds: 4890, title: "Finding your own agentic use case" },
      { startSeconds: 4920, title: "Building two MCP tools" },
      { startSeconds: 4980, title: "Session 2 preview: Resources, prompts, and memory" },
      { startSeconds: 5040, title: "Session 3 guest: Luca Chang (MCP core contributor)" },
      { startSeconds: 5100, title: "Questions about tool execution and LLM behavior" },
      { startSeconds: 5280, title: "Understanding the restaurant analogy deeper" },
      { startSeconds: 5400, title: "Context window management strategies" },
      { startSeconds: 5520, title: "Tools vs schemas: What the LLM actually sees" },
      { startSeconds: 5700, title: "Handling tool failures and validation" },
      { startSeconds: 5880, title: "Discovery and prompt engineering for tools" },
      { startSeconds: 6000, title: "Multiple tool orchestration patterns" },
    ],
  },
  {
    id: "session-2-recording",
    session: 2,
    date: "2025-10-08",
    title: "Advanced MCP Features",
    youtubeId: "TZ_UVMsj9Ls",
    durationSeconds: 7010,
    searchPlaceholder: "Try “memory” or “sampling”",
    chapters: [
      { startSeconds: 0, title: "Session start and overview" },
      { startSeconds: 110, title: "Student project discussions" },
      { startSeconds: 157, title: "Library agent for multimedia archives" },
      { startSeconds: 300, title: "Restaurant recommender with visual AI" },
      { startSeconds: 444, title: "Fashion outfit agent with weather integration" },
      { startSeconds: 930, title: "Enhanced newspaper agent overview" },
      { startSeconds: 1300, title: "Server instructions and context" },
      { startSeconds: 1680, title: "Live demo: Creating personalized newspapers" },
      { startSeconds: 2400, title: 'Understanding model "laziness"' },
      { startSeconds: 2580, title: "MCP Inspector walkthrough" },
      { startSeconds: 2910, title: "Interest management system" },
      { startSeconds: 3150, title: "Vector databases for article memory" },
      { startSeconds: 3210, title: "Server-suggested workflows" },
      { startSeconds: 3300, title: "Restaurant analogy: Weekend specials" },
      { startSeconds: 3360, title: "Creating reusable templates" },
      { startSeconds: 3480, title: "Restaurant analogy: Nutritional facts" },
      { startSeconds: 3690, title: "VS Code integration demo" },
      { startSeconds: 3900, title: "Preventing unwanted executions" },
      { startSeconds: 4020, title: "Direct server-to-user communication" },
      { startSeconds: 4140, title: "Live demo: User confirmations" },
      { startSeconds: 4320, title: "MCP Sampling introduction" },
      { startSeconds: 4380, title: "ChatGPT Apps SDK compatibility" },
      { startSeconds: 4440, title: "HTML resources as interfaces" },
      { startSeconds: 4500, title: "Smart tools architecture" },
      { startSeconds: 4560, title: "Content ID efficiency pattern" },
      { startSeconds: 4740, title: "Server-requested LLM reasoning" },
    ],
  },
  {
    id: "session-3-recording",
    session: 3,
    date: "2025-10-15",
    title: "Multi-Agent Systems & Production Patterns",
    youtubeId: "4YrRODYnYHY",
    durationSeconds: 5223,
    searchPlaceholder: "Try “reviewer” or “context”",
    chapters: [
      { startSeconds: 0, title: "Welcome and attendance" },
      { startSeconds: 110, title: "Student project showcase begins" },
      { startSeconds: 240, title: "Sports news agent with betting odds" },
      { startSeconds: 300, title: "Restaurant recommender with visual AI" },
      { startSeconds: 360, title: "Luca Chang introduction (MCP core contributor)" },
      { startSeconds: 480, title: "Newspaper agent limitations review" },
      { startSeconds: 540, title: "Token costs: Input vs output pricing" },
      { startSeconds: 600, title: "Context length limits across models" },
      { startSeconds: 720, title: "Context rot: Performance degradation with scale" },
      { startSeconds: 780, title: "Needle in haystack problem: Tool selection" },
      { startSeconds: 960, title: "Tool bloat: IBM research findings" },
      { startSeconds: 1020, title: "Real example: Claude tool confusion" },
      { startSeconds: 1140, title: "Similar-sounding tools problem" },
      { startSeconds: 1380, title: "Domain-specific agents concept" },
      { startSeconds: 1500, title: "Extracting preference agent from news agent" },
      { startSeconds: 1620, title: "Testing preference agent standalone" },
      { startSeconds: 1680, title: "Add/remove interests implementation" },
      { startSeconds: 1920, title: "Decoupling: No news mentions in preference tools" },
      { startSeconds: 2040, title: "Vector DB for semantic preference search" },
      { startSeconds: 2220, title: "Store preference with metadata (time, depth)" },
      { startSeconds: 2400, title: "Semantic distance and relevance scoring" },
      { startSeconds: 2580, title: "MCP client testing without LLM calls" },
      { startSeconds: 2700, title: "Embedding functions and distance metrics" },
      { startSeconds: 2880, title: "Reviewing agent specialization benefits" },
      { startSeconds: 3000, title: "Wrapping preference agent as MCP server" },
      { startSeconds: 3060, title: "Chat tool: Exposing agent capabilities" },
      { startSeconds: 3180, title: "Producer-reviewer pattern explained" },
      { startSeconds: 3240, title: "Content quality gates and validation" },
      { startSeconds: 3300, title: "Reusability: Domain-agnostic design" },
      { startSeconds: 3360, title: "Running news + preference agents together" },
      { startSeconds: 3600, title: "News agent queries preferences at start" },
      { startSeconds: 4020, title: "Preference agent performs semantic searches" },
      { startSeconds: 4200, title: "Review process: Approve vs deny workflow" },
      { startSeconds: 4380, title: "Haiku 4.5 vs 3.5 capability comparison" },
      { startSeconds: 4440, title: "Preference agent denies initial report" },
      { startSeconds: 4500, title: "News agent revision based on feedback" },
      { startSeconds: 4560, title: "When to split agents: Three questions" },
      { startSeconds: 4620, title: "Domain boundaries and security isolation" },
      { startSeconds: 4680, title: "Complexity thresholds for separation" },
      { startSeconds: 4740, title: "Parallel tool execution in agents" },
      { startSeconds: 4800, title: "Multi-agent relationships and dominance" },
      { startSeconds: 4860, title: "Crew AI vs Langchain comparison" },
      { startSeconds: 4980, title: "Vector DB necessity for multi-agent" },
      { startSeconds: 5100, title: "Context compaction strategies and quality" },
      { startSeconds: 5220, title: "Claude vs Amazon Q compaction approaches" },
    ],
  },
];

export const resources: {
  name: string;
  description: string;
  url: string | null;
  action?: string;
  note?: string;
  download?: string;
}[] = [
  {
    name: "2026 public repository",
    description: "The home for this year’s course materials.",
    url: course.publicRepositoryUrl,
    action: "Open the repository",
  },
  {
    name: "Session 1 slides",
    description: "Download the HTML slide deck and open it in your browser.",
    url: "https://raw.githubusercontent.com/adityaarunsinghal/agentic-ai-workshop-2026/refs/heads/main/session-01-agent-harnesses/session-01-agent-harnesses-2026-10-07.html",
    action: "Download Session 1 slides",
    download: "session-01-agent-harnesses-2026-10-07.html",
  },
  {
    name: "Session 1 starter code",
    description: "Code to run, inspect, and make your own.",
    url: `${course.publicRepositoryUrl}/tree/main/session-01-agent-harnesses/demo-app`,
    action: "Open starter code",
  },
  {
    name: "Class app store",
    description: "Publish your project and explore what others in the workshop build.",
    url: course.appStoreUrl,
    action: "Open the class app store",
    note: "(For registered students only)",
  },
];

export function courseAction(state: CourseState) {
  if (state === "registration-open")
    return {
      label: "Register for the workshop",
      href: course.registrationUrl,
      note: `Register by ${course.deadline}.`,
    };
  if (state === "registration-closed")
    return {
      label: "View the schedule",
      href: `${course.path}#schedule`,
      note: "Registration has closed.",
    };
  if (state === "in-progress")
    return {
      label: "View course materials",
      href: `${course.path}#materials`,
      note: "The workshop is in progress. Registration has closed.",
    };
  return {
    label: "View course materials",
    href: `${course.path}#materials`,
    note: "The 2026 workshop has concluded.",
  };
}

export const pageDefinitions = [
  {
    path: course.path,
    kind: "current",
    title: "Agentic AI Workshop 2026 | NYU CDS | Adi Singhal",
    description:
      "Four in-person Thursday sessions at NYU CDS, October 8–29, 2026. Learn agents, harnesses, interactive apps, and coordination through slides, demonstrations, and starter code.",
    canonical: course.path,
  },
  {
    path: course.archivePath,
    kind: "archive",
    title: "Agentic AI Workshop 2025 Archive | Adi Singhal",
    description:
      "The 2025 NYU CDS workshop archive: full session recordings with searchable chapters, course outline, MCP newspaper project, highlights, and public code.",
    canonical: course.archivePath,
  },
  {
    path: "/agentic-ai-workshop/registration-form/",
    kind: "registration",
    title: "2026 Workshop Registration | NYU CDS",
    description:
      "Registration information for the 2026 NYU CDS Agentic AI Workshop.",
    canonical: "/agentic-ai-workshop/registration-form/",
  },
  {
    path: "/registration-form/",
    kind: "registration",
    title: "2026 Workshop Registration | NYU CDS",
    description:
      "Registration information for the 2026 NYU CDS Agentic AI Workshop.",
    canonical: "/agentic-ai-workshop/registration-form/",
  },
  {
    path: "/agentic-ai-workshop/feedback/",
    kind: "feedback",
    title: "2025 Workshop Feedback | NYU CDS",
    description: "Feedback for the October 2025 workshop.",
    canonical: "/agentic-ai-workshop-2025/feedback/",
  },
  {
    path: "/agentic-ai-workshop-2025/feedback/",
    kind: "feedback",
    title: "2025 Workshop Feedback | NYU CDS",
    description: "Feedback for the October 2025 workshop.",
    canonical: "/agentic-ai-workshop-2025/feedback/",
  },
  {
    path: "/agentic-ai-workshop-2025/registration-form/",
    kind: "archived-registration",
    title: "2025 Workshop Registration Archive | NYU CDS",
    description: "Registration for the 2025 workshop is closed.",
    canonical: "/agentic-ai-workshop-2025/registration-form/",
  },
] as const;

export function workshopPage(pathname: string) {
  const canonical = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return pageDefinitions.find((page) => page.path === canonical);
}
