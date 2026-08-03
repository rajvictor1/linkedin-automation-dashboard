"use server";

import { z } from "zod";
import { getFirecrawl, getOpenAI, ConfigurationError } from "@/lib/providers";
import type { CarouselProgressEvent, CarouselRun, CarouselSlide, CarouselSource } from "@/lib/types";

type Progress = Extract<CarouselProgressEvent, { type: "progress" }>;
type Send = (event: Progress) => void;

const contentSlideSchema = z.object({
  title: z.string().min(4).max(80),
  body: z.string().min(8).max(180),
});

const planSchema = z.object({
  topic: z.string().min(8).max(120),
  slides: z.array(contentSlideSchema).length(4),
});

const DISCOVERY_KEYWORDS = [
  "artificial intelligence", "agentic AI", "AI agents", "enterprise AI", "intelligent automation",
  "IT infrastructure", "cloud computing", "cybersecurity", "developer tools", "data centers",
];

const SEARCH_QUERIES = [
  "latest artificial intelligence agentic AI AI agents enterprise news",
  "latest intelligent automation developer tools cybersecurity news",
  "latest cloud computing IT infrastructure data centers robotics news",
];

const TRUSTED_DOMAINS = [
  "reuters.com", "apnews.com", "bloomberg.com", "ft.com", "wsj.com", "techcrunch.com",
  "theverge.com", "wired.com", "arstechnica.com", "venturebeat.com", "computerworld.com",
  "cio.com", "technologyreview.com", "openai.com", "anthropic.com", "deepmind.google",
  "github.blog", "martech.org", "gartner.com", "forrester.com", "zdnet.com",
];

function isTrusted(url: string) {
  return TRUSTED_DOMAINS.some((d) => url.includes(d));
}

function generateRunId() {
  return crypto.randomUUID();
}

function cleanJson(text: string) {
  let trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    trimmed = trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }
  return trimmed;
}

export async function generateCarousel(send?: Send): Promise<CarouselRun> {
  if (!send) send = () => {};

  try {
    getOpenAI();
    getFirecrawl();
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError("OPENAI_API_KEY or FIRECRAWL_API_KEY");
  }

  send({ type: "progress", node: "discovery", status: "running", message: "Searching current AI, automation, and enterprise IT news" });

  const firecrawl = getFirecrawl();
  const allRaw: { title?: string; url?: string; description?: string; snippet?: string; source?: string }[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const result: any = await firecrawl.search(query, { limit: 10 });
      const data = Array.isArray(result.data) ? result.data : [];
      allRaw.push(...data.map((item: any) => ({
        title: item.title,
        url: item.url,
        description: item.description,
        snippet: item.snippet,
        source: item.metadata?.source ?? "web",
      })));
    } catch {
      // continue with remaining queries
    }
  }

  const deduped = new Map<string, CarouselSource>();
  for (const item of allRaw) {
    if (!item.url || !item.title) continue;
    const url = item.url.startsWith("http") ? item.url : `https://${item.url}`;
    const score = (isTrusted(url) ? 25 : 0) + (item.description ? 10 : 0) + (item.snippet ? 5 : 0);
    if (!deduped.has(url)) {
      deduped.set(url, {
        title: item.title,
        url,
        summary: item.description || item.snippet || "",
        source: item.source || "web",
        score: Math.min(score + 60, 99),
        reason: isTrusted(url) ? "Trusted domain with relevant content" : "Relevant web result",
      });
    }
  }

  let sources = Array.from(deduped.values()).sort((a, b) => b.score - a.score).slice(0, 12);
  if (sources.length === 0) {
    sources = [{
      title: "No live articles found",
      url: "https://example.com/research-fallback",
      summary: "Firecrawl returned no results. Generating from topic knowledge.",
      source: "fallback",
      score: 50,
      reason: "Fallback knowledge",
    }];
  }

  send({ type: "progress", node: "selection", status: "running", message: "Selecting the strongest story" });

  const openai = getOpenAI();
  const sourceContext = sources.slice(0, 6).map((s, i) =>
    `${i + 1}. ${s.title} | URL: ${s.url} | Summary: ${s.summary}`
  ).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a LinkedIn content strategist. Pick the strongest story from the provided sources and plan a 5-slide carousel.\nSlides 1-4 are content. Slide 5 is a CTA.\nWrite punchy, shareable copy for slides 1-4. Return only valid JSON with keys: topic (string) and slides (array of 4 objects with title and body).",
      },
      {
        role: "user",
        content: `Sources:\n${sourceContext}\n\nPlan a 4-slide content narrative plus a CTA slide with the fixed watermark "rajeshkumar.com/subscribe".`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = cleanJson(completion.choices[0]?.message?.content || "{}");
  const parsed = planSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid carousel plan: ${parsed.error.message}`);
  }
  const plan = parsed.data;

  const selectedArticle = sources[0];

  send({ type: "progress", node: "copywriting", status: "done", message: `Selected: ${selectedArticle.title}` });

  const slides: CarouselSlide[] = plan.slides.map((s, idx) => ({
    index: idx + 1,
    kind: "content",
    title: s.title,
    body: s.body,
    imagePrompt: `Clean, premium LinkedIn carousel slide ${idx + 1} of 5. Modern editorial SaaS style. Warm beige/cream background (#F3EFE7), charcoal text (#1C1917), muted brown accents (#8B7E6A), generous whitespace, thin subtle dividers. Headline: "${s.title}". Supporting idea: "${s.body}". Include a soft abstract gradient or minimal icon/illustration in the background, no cartoon, no UI chrome, no watermark. Square 1:1 format, polished and ready for LinkedIn.`,
    watermark: "rajeshkumar.com/subscribe",
  }));

  slides.push({
    index: 5,
    kind: "cta",
    title: "Stay ahead",
    body: "Follow for weekly AI, automation, and enterprise insights.",
    imagePrompt: `Clean, premium LinkedIn carousel slide 5 of 5. Modern editorial SaaS style. Warm beige/cream background (#F3EFE7), charcoal text (#1C1917), muted brown accents (#8B7E6A). Headline: "Stay ahead". Subtext: "Follow for weekly AI, automation, and enterprise insights." Include a subtle arrow or abstract shape. Watermark at bottom center: "rajeshkumar.com/subscribe". Square 1:1 format, polished and ready for LinkedIn.`,
    watermark: "rajeshkumar.com/subscribe",
  });

  send({ type: "progress", node: "images", status: "running", message: "Rendering all 5 slides as artwork" });

  for (let i = 0; i < slides.length; i++) {
    try {
      const image: any = await openai.images.generate({
        model: "gpt-image-1-mini",
        prompt: slides[i].imagePrompt,
        n: 1,
        size: "1024x1024",
      });
      const b64 = image.data?.[0]?.b64_json || image.data?.[0]?.content;
      if (b64) {
        slides[i].imageDataUrl = `data:image/png;base64,${b64}`;
      }
      send({ type: "progress", node: "images", status: "running", message: `Rendered slide ${i + 1} of 5` });
    } catch (error) {
      send({ type: "progress", node: "images", status: "error", message: `Slide ${i + 1} image failed: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  send({ type: "progress", node: "images", status: "done", message: "All slides rendered" });

  const run: CarouselRun = {
    id: generateRunId(),
    topic: plan.topic,
    createdAt: new Date().toISOString(),
    keywords: DISCOVERY_KEYWORDS,
    sources,
    selectedArticle,
    slides,
  };

  send({ type: "progress", node: "review", status: "done", message: "Ready for review" });
  return run;
}
