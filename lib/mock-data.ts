export type ContentType = "carousel" | "newsletter" | "both";
export type StageStatus = "pending" | "active" | "complete" | "future";

export interface PipelineStage {
  id: string;
  label: string;
  agent: string;
  tool: string;
  contentType: ContentType;
  status: StageStatus;
  summary: string;
  detail: string;
  data?: unknown;
}

export interface PipelineResult {
  topic: string;
  mode: ContentType;
  research: string;
  ideas: { title: string; hook: string; format: string }[];
  selected: { title: string; hook: string; format: string };
  carousel: {
    slides: { headline: string; body: string }[];
    caption: string;
  };
  newsletter: string;
  visuals: string[];
}

export interface GeneratedImage {
  slide: number;
  prompt: string;
  url: string | null;
  loading: boolean;
  error?: string;
}

export function buildStages(result: PipelineResult): PipelineStage[] {
  const contentType: ContentType =
    result.mode === "both"
      ? result.selected.format === "carousel"
        ? "carousel"
        : result.selected.format === "newsletter"
          ? "newsletter"
          : "both"
      : result.mode;

  return [
    {
      id: "ideas",
      label: "Ideas",
      agent: "Ideation Agent",
      tool: "OpenAI Chat",
      contentType,
      status: "complete",
      summary: `${result.ideas.length} angles generated; "${result.selected.title}" selected.`,
      detail: result.ideas.map((idea, i) => `${i + 1}. ${idea.title}\n   Hook: ${idea.hook}\n   Format: ${idea.format}`).join("\n\n"),
      data: result.ideas,
    },
    {
      id: "research",
      label: "Research",
      agent: "Research Agent",
      tool: "Firecrawl",
      contentType,
      status: "complete",
      summary: result.research.startsWith("Topic:") ? `Topic received: ${result.topic}` : "Source scraped and summarized.",
      detail: result.research,
      data: result.research,
    },
    {
      id: "writing",
      label: "Writing",
      agent: "Outline + Writer Agent",
      tool: "OpenAI Chat",
      contentType: result.mode === "both" ? "both" : result.mode,
      status: "complete",
      summary: result.mode === "carousel" || result.mode === "both"
        ? `${result.carousel.slides.length}-slide carousel draft ready`
        : "Newsletter draft ready",
      detail: result.mode === "newsletter"
        ? result.newsletter
        : result.carousel.slides.map((s, i) => `Slide ${i + 1}: ${s.headline}\n${s.body}`).join("\n\n"),
      data: result,
    },
    {
      id: "visuals",
      label: "Visuals",
      agent: "Visual Agent",
      tool: "OpenAI Image",
      contentType: "carousel",
      status: "active",
      summary: `${result.visuals.length} carousel image prompts ready. Click Generate to create images.`,
      detail: result.visuals.map((prompt, i) => `Image ${i + 1}: ${prompt}`).join("\n\n"),
      data: result.visuals,
    },
    {
      id: "review",
      label: "Review",
      agent: "Export Agent",
      tool: "Human review",
      contentType: result.mode === "newsletter" ? "newsletter" : "carousel",
      status: "future",
      summary: "Awaiting final approval.",
      detail: "Review the generated carousel and/or newsletter. Approve to mark ready.",
    },
    {
      id: "ready",
      label: "Ready",
      agent: "Export Agent",
      tool: "File assembly",
      contentType: result.mode === "newsletter" ? "newsletter" : "carousel",
      status: "future",
      summary: "Deliverables prepared for download.",
      detail: "Download carousel caption and/or newsletter below.",
    },
    {
      id: "scheduled",
      label: "Scheduled",
      agent: "Hermes / OpenClaw",
      tool: "Scheduler (future)",
      contentType: result.mode === "newsletter" ? "newsletter" : "carousel",
      status: "future",
      summary: "Not scheduled yet.",
      detail: "Once the scheduler backend is connected, you can queue posts here.",
    },
    {
      id: "published",
      label: "Published",
      agent: "Hermes / OpenClaw",
      tool: "LinkedIn API (future)",
      contentType: result.mode === "newsletter" ? "newsletter" : "carousel",
      status: "future",
      summary: "Not published yet.",
      detail: "After publishing, the LinkedIn post URL will appear here.",
    },
  ];
}

export const DEFAULT_TOPIC = "5 mistakes solopreneurs make with AI content";

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
