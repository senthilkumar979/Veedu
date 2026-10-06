export interface AssistantReply {
  answer: string;
  sources: string[];
}

export function stubHouseholdAssistant(question: string): AssistantReply {
  const q = question.toLowerCase();
  if (q.includes("bill")) {
    return {
      answer: "Electricity is due tomorrow (€82.40). Internet is due in about a week. Rent is scheduled later this month.",
      sources: ["bills", "subscriptions"],
    };
  }
  if (q.includes("document") || q.includes("expir")) {
    return {
      answer: "Residence Permit expires in ~47 days and needs attention. Driving License and Passport look fine.",
      sources: ["documents"],
    };
  }
  if (q.includes("week") || q.includes("coming")) {
    return {
      answer: "This week: electricity payment, Netflix renewal window, and Father's Birthday coming up. Keep grocery and document prep tasks moving.",
      sources: ["calendar", "tasks", "important-dates", "subscriptions"],
    };
  }
  return {
    answer: "I can summarize bills, documents, tasks, subscriptions, and upcoming dates for your household. Ask about this week, bills, or expiring documents. (Stub mode — set OPENAI_API_KEY or ANTHROPIC_API_KEY for live LLM.)",
    sources: ["household"],
  };
}

export function stubTechRadar() {
  return [
    { title: "React ecosystem update", detail: "Server Components patterns continue to mature for data-heavy dashboards." },
    { title: "Frontend architecture pattern", detail: "Feature folders + shared domain packages keep web and desktop in sync." },
    { title: "Developer tooling release", detail: "Type-safe monorepos with pnpm workspaces reduce drift across apps." },
  ];
}

export function stubContentGenerator(idea: string) {
  const topic = idea.trim() || "household operating systems for calm productivity";
  return {
    linkedinPost: `Just shipped a calm household OS concept around "${topic}". Less dashboard noise, more: what needs attention today?`,
    linkedinArticle: `# Building calm household software\n\n${topic} deserves interfaces that prioritize attention, today, and next — not endless CRUD.`,
    medium: `## ${topic}\n\nHousehold software should feel like an operating system for daily life: shared + private records, proactive reminders, and optional AI at the edges.`,
    outline: ["Hook", "Problem", "Product principles", "Architecture", "CTA"],
  };
}
