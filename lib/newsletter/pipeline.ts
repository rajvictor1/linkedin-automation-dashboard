"use server";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getFirecrawl, getOpenAI, ConfigurationError } from "@/lib/providers";
import type { NewsletterDraft, NewsletterProgressEvent, NewsletterRun, NewsletterSource } from "@/lib/types";

type Progress = Extract<NewsletterProgressEvent, { type: "progress" }>;
type Send = (event: Progress) => void;

const sectionSchema = z.object({
  heading: z.string().min(1).max(120),
  body: z.string().min(1).max(2200),
  citations: z.array(z.number().int().min(1).max(8)).min(1).max(4),
});

const draftSchema = z.object({
  subject: z.string().min(1).max(120),
  previewText: z.string().min(1).max(240),
  title: z.string().min(1).max(160),
  dek: z.string().min(1).max(400),
  introduction: z.string().min(1).max(1600),
  sections: z.array(sectionSchema).min(2).max(6),
  closing: z.string().min(1).max(1200),
});

function generateRunId() {
  return crypto.randomUUID();
}

export async function generateNewsletter(topic: string, includeLeadVisual: boolean, send?: Send): Promise<NewsletterRun> {
  if (!send) send = () => {};

  try {
    getOpenAI();
    getFirecrawl();
  } catch (error) {
    if (error instanceof ConfigurationError) throw error;
    throw new ConfigurationError("OPENAI_API_KEY or FIRECRAWL_API_KEY");
  }

  send({ type: "progress", node: "research", status: "running", message: `Researching sources for: ${topic}` });

  const firecrawl = getFirecrawl();
  let rawSources: NewsletterSource[] = [];

  try {
    const result: any = await firecrawl.search(`${topic} latest news analysis`, { limit: 10 });
    const data = Array.isArray(result.data) ? result.data : [];
    rawSources = data
      .map((item: any) => ({
        title: item.title || "Untitled",
        url: item.url?.startsWith("http") ? item.url : `https://${item.url || ""}`,
        summary: item.description || item.snippet || "",
        source: item.metadata?.source || "web",
      }))
      .filter((s: NewsletterSource) => s.url.startsWith("http"));
  } catch {
    rawSources = [];
  }

  if (rawSources.length === 0) {
    rawSources = [{
      title: "No live sources found",
      url: "https://example.com/research-fallback",
      summary: "Firecrawl returned no results. Generating from topic knowledge.",
      source: "fallback",
    }];
  }

  send({ type: "progress", node: "writing", status: "running", message: "Writing structured, cited newsletter" });

  const openai = getOpenAI();
  const sourceContext = rawSources.slice(0, 6).map((s, i) =>
    `${i + 1}. ${s.title} | ${s.url} | ${s.summary}`
  ).join("\n\n");

  const draftCompletion: any = await (openai as any).beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a newsletter editor for a personal brand focused on AI, automation, and enterprise technology. Write a structured, cited, human-sounding newsletter with a strong hook, clear sections, and a CTA.",
      },
      {
        role: "user",
        content: `Topic: ${topic}\n\nSources:\n${sourceContext}\n\nWrite the newsletter. Return JSON matching the schema.`,
      },
    ],
    response_format: zodTextFormat(draftSchema, "newsletter_draft"),
    temperature: 0.7,
  });

  const draft: NewsletterDraft = draftCompletion.choices[0]?.message?.parsed;
  if (!draft) throw new Error("Failed to parse newsletter draft");

  let leadVisual: NewsletterRun["leadVisual"] = undefined;
  if (includeLeadVisual) {
    send({ type: "progress", node: "visual", status: "running", message: "Generating newsletter lead visual" });
    try {
      const image: any = await openai.images.generate({
        model: "gpt-image-1-mini",
        prompt: `Minimal editorial newsletter hero image. Topic: ${topic}. Calm warm beige and charcoal palette, abstract shapes, no text, no UI, premium SaaS style. 16:9 landscape format.`,
        n: 1,
        size: "1024x1024",
      });
      const b64 = image.data?.[0]?.b64_json || image.data?.[0]?.content;
      if (b64) {
        leadVisual = {
          dataUrl: `data:image/png;base64,${b64}`,
          prompt: "Lead visual for newsletter",
        };
      }
    } catch (error) {
      send({ type: "progress", node: "visual", status: "error", message: `Visual failed: ${error instanceof Error ? error.message : String(error)}` });
    }
  }

  send({ type: "progress", node: "review", status: "done", message: "Newsletter ready for review" });

  return {
    id: generateRunId(),
    topic,
    createdAt: new Date().toISOString(),
    sources: rawSources,
    draft,
    leadVisual,
  };
}
