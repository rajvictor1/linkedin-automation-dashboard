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
}

export const CAROUSEL_CAPTION =
  "Most solopreneurs are wasting AI.\n\nHere are 5 mistakes I see every week — and how to fix them:\n\n1. Using AI without a clear voice\n2. Chasing trends instead of problems\n3. Writing prompts that are too vague\n4. Skipping the editing loop\n5. Forgetting a call to action\n\nGive AI a clear role, voice, and feedback loop. One founder I coached saved 10 hours a week doing exactly that.\n\nSave this carousel and try it today.";

export const NEWSLETTER_MARKDOWN = `# 5 AI Mistakes Solopreneurs Make (And How to Fix Them)

Most solopreneurs are wasting AI. They treat it like a magic intern, expect instant results, and then blame the tool when the content sounds generic.

Here are the five mistakes I see every week:

## 1. Using AI without a clear voice
AI has no idea what *you* sound like until you tell it. Create a short voice guide with your tone, examples, and words you avoid.

## 2. Chasing trends instead of problems
Trends bring vanity metrics. Solving one painful problem for one reader builds trust.

## 3. Writing prompts that are too vague
"Write a LinkedIn post about AI" gives you mush. "Write a 5-slide carousel for solopreneurs about AI content mistakes, with a story and a CTA" gives you something usable.

## 4. Skipping the editing loop
AI output is a first draft, not a final post. Read it aloud. Cut the fluff. Add your own example.

## 5. Forgetting a call to action
Every post needs a next step. Save the post, try the prompt, or reply with your biggest challenge.

---

One founder I coached applied this loop and saved 10 hours a week. Start with voice. End with a CTA. Everything in between gets easier.
`;

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "ideas",
    label: "Ideas",
    agent: "Ideation Agent",
    tool: "OpenAI Chat",
    contentType: "both",
    status: "complete",
    summary: "3 angles generated; '5 AI mistakes solopreneurs make' selected.",
    detail:
      "1. The 5 AI mistakes that cost solopreneurs time and trust.\n2. How I built a one-person content engine in 90 minutes a day.\n3. The simple prompt framework that doubled my LinkedIn engagement.",
  },
  {
    id: "research",
    label: "Research",
    agent: "Research Agent",
    tool: "Firecrawl",
    contentType: "both",
    status: "complete",
    summary: "8 sources scraped; 12 key points extracted.",
    detail:
      "• Mistake #1: Using AI without a clear voice.\n• Mistake #2: Chasing trends instead of problems.\n• Mistake #3: Writing prompts that are too vague.\n• Mistake #4: Skipping the editing loop.\n• Mistake #5: Forgetting a call to action.",
  },
  {
    id: "writing",
    label: "Writing",
    agent: "Outline + Writer Agent",
    tool: "OpenAI Chat",
    contentType: "carousel",
    status: "complete",
    summary: "5-slide carousel draft ready; hook: 'Most solopreneurs waste AI.'",
    detail:
      "Slide 1: Hook — Most solopreneurs are wasting AI.\nSlide 2: Problem — They treat AI like a magic intern.\nSlide 3: Solution — Give AI a clear role, voice, and loop.\nSlide 4: Proof — One founder saved 10 hours a week.\nSlide 5: CTA — Save this carousel and try it today.",
  },
  {
    id: "visuals",
    label: "Visuals",
    agent: "Visual Agent",
    tool: "OpenAI Image",
    contentType: "carousel",
    status: "active",
    summary: "Generating 5 carousel images in Zen theme.",
    detail:
      "Image 1: Minimal charcoal text on warm beige.\nImage 2: Abstract single-founder desk illustration.\nImage 3: Split screen: vague vs. precise prompt.\nImage 4: Simple bar chart icon, 10 hours saved.\nImage 5: CTA slide with soft arrow.",
  },
  {
    id: "review",
    label: "Review",
    agent: "Export Agent",
    tool: "Human review",
    contentType: "newsletter",
    status: "future",
    summary: "Awaiting final copy approval.",
    detail:
      "Newsletter preview will appear here. You can edit the headline, subheadings, and call to action before marking it ready.",
  },
  {
    id: "ready",
    label: "Ready",
    agent: "Export Agent",
    tool: "File assembly",
    contentType: "newsletter",
    status: "future",
    summary: "Deliverables prepared for download.",
    detail:
      "Carousel image pack + caption text, and newsletter Markdown/HTML will be available here.",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    agent: "Hermes / OpenClaw",
    tool: "Scheduler (future)",
    contentType: "carousel",
    status: "future",
    summary: "Post queued for next Tuesday, 9:00 AM IST.",
    detail:
      "Once the scheduler backend is connected, this card will show the queue and allow rescheduling.",
  },
  {
    id: "published",
    label: "Published",
    agent: "Hermes / OpenClaw",
    tool: "LinkedIn API (future)",
    contentType: "carousel",
    status: "future",
    summary: "Live LinkedIn post link will appear here.",
    detail:
      "After publishing, engagement metrics and the post URL will be surfaced in this stage.",
  },
];

export const DEFAULT_TOPIC = "5 mistakes solopreneurs make with AI content";
export const VISUAL_IMAGE_COUNT = 5;

export const SLIDE_IMAGES = Array.from({ length: VISUAL_IMAGE_COUNT }, (_, i) => ({
  slide: i + 1,
  label: `Slide ${i + 1}`,
  description: [
    "Minimal charcoal text on warm beige.",
    "Abstract single-founder desk illustration.",
    "Split screen: vague vs. precise prompt.",
    "Simple bar chart icon, 10 hours saved.",
    "CTA slide with soft arrow.",
  ][i],
}));
