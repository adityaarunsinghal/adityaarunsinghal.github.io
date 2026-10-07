export type CourseState =
  "registration-open" | "registration-closed" | "in-progress" | "complete";

export const course = {
  // Change deliberately with the form owner. A visitor's clock cannot establish acceptance.
  state: "registration-open" as CourseState,
  year: 2026,
  path: "/agentic-ai-workshop/",
  archivePath: "/agentic-ai-workshop-2025/",
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
    url: "https://nyu-workshop.adityasinghal.com/",
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
      "The 2025 NYU CDS workshop archive: course outline, MCP newspaper project, highlights, and public code.",
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
