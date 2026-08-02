"use client";

import { useState } from "react";
import { TopicInput } from "@/components/TopicInput";
import { PipelineStrip } from "@/components/pipeline/PipelineStrip";
import {
  DEFAULT_TOPIC,
  buildStages,
  type PipelineResult,
  type GeneratedImage,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

const FALLBACK_RESULT: PipelineResult = {
  topic: DEFAULT_TOPIC,
  mode: "both",
  research: `Topic: ${DEFAULT_TOPIC}`,
  ideas: [
    {
      title: "5 AI mistakes solopreneurs make",
      hook: "Most solopreneurs are wasting AI.",
      format: "carousel",
    },
    {
      title: "Build a one-person content engine",
      hook: "90 minutes a day is enough.",
      format: "both",
    },
    {
      title: "The prompt that doubled my LinkedIn engagement",
      hook: "Specificity beats cleverness.",
      format: "carousel",
    },
  ],
  selected: {
    title: "5 AI mistakes solopreneurs make",
    hook: "Most solopreneurs are wasting AI.",
    format: "carousel",
  },
  carousel: {
    slides: [
      {
        headline: "Most solopreneurs are wasting AI",
        body: "They treat it like a magic intern and blame the tool.",
      },
      {
        headline: "Mistake #1: No clear voice",
        body: "AI copies everyone until you tell it who you are.",
      },
      {
        headline: "Mistake #2: Vague prompts",
        body: "Bad prompts give you mush. Specific prompts give you drafts.",
      },
      {
        headline: "Mistake #3: Skipping the loop",
        body: "AI output is a first draft, not a final post.",
      },
      {
        headline: "Fix it today",
        body: "Give AI a role, a voice, and a feedback loop.",
      },
    ],
    caption:
      "Most solopreneurs are wasting AI.\n\nHere are 5 mistakes I see every week — and how to fix them.\n\nSave this carousel and try it today.",
  },
  newsletter: `# 5 AI Mistakes Solopreneurs Make (And How to Fix Them)

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
`,
  visuals: [
    "Minimal professional LinkedIn carousel slide 1 of 5. Warm beige background, charcoal text, soft shadows. Headline: 'Most solopreneurs are wasting AI'. Clean, zen, no clutter.",
    "Minimal professional LinkedIn carousel slide 2 of 5. Warm beige background, charcoal text, soft shadows. Headline: 'Mistake #1: No clear voice'. Clean, zen, no clutter.",
    "Minimal professional LinkedIn carousel slide 3 of 5. Warm beige background, charcoal text, soft shadows. Headline: 'Mistake #2: Vague prompts'. Clean, zen, no clutter.",
    "Minimal professional LinkedIn carousel slide 4 of 5. Warm beige background, charcoal text, soft shadows. Headline: 'Mistake #3: Skipping the loop'. Clean, zen, no clutter.",
    "Minimal professional LinkedIn carousel slide 5 of 5. Warm beige background, charcoal text, soft shadows. Headline: 'Fix it today'. Clean, zen, no clutter.",
  ],
};

export default function Page() {
  const [topic, setTopic] = useState(DEFAULT_TOPIC);
  const [mode, setMode] = useState<"carousel" | "newsletter" | "both">("both");
  const [stages, setStages] = useState(buildStages(FALLBACK_RESULT));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>(
    FALLBACK_RESULT.visuals.map((prompt, i) => ({
      slide: i + 1,
      prompt,
      url: null,
      loading: false,
    }))
  );
  const [imageLoading, setImageLoading] = useState(false);

  async function runPipeline(newTopic: string, newMode: typeof mode) {
    setLoading(true);
    setError(null);
    setImages([]);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic, mode: newMode }),
      });
      const result = (await res.json()) as PipelineResult & { error?: string };
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      const okResult = result as PipelineResult;
      setStages(buildStages(okResult));
      setImages(
        okResult.visuals.map((prompt, i) => ({
          slide: i + 1,
          prompt,
          url: null,
          loading: false,
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Pipeline failed");
      // Keep fallback data visible so UI stays functional
    } finally {
      setLoading(false);
    }
  }

  async function generateImages() {
    setImageLoading(true);
    try {
      const nextImages = [...images];
      await Promise.all(
        nextImages.map(async (img, i) => {
          nextImages[i] = { ...img, loading: true };
          const res = await fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: img.prompt }),
          });
          const data = (await res.json()) as { url?: string; error?: string };
          nextImages[i] = {
            ...img,
            url: data.url || null,
            loading: false,
            error: data.error,
          };
        })
      );
      setImages(nextImages);
    } catch (err) {
      console.error(err);
      setError("Image generation failed");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="min-h-svh bg-background p-6 lg:p-10 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground">
            LinkedIn Content Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Carousel + Newsletter pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Badge variant="outline" className="w-fit font-mono text-xs">
            OpenAI + Firecrawl enabled
          </Badge>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error} — showing fallback content.</span>
        </div>
      )}

      <TopicInput
        defaultTopic={topic}
        defaultMode={mode}
        onRun={(t, m) => {
          setTopic(t);
          setMode(m);
          runPipeline(t, m);
        }}
        running={loading}
      />

      <section className="flex-1 min-h-[480px] flex flex-col">
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-serif text-xl">Pipeline: {topic}</h2>
          <p className="text-xs text-muted-foreground font-mono">
            Ideas → Research → Writing → Visuals → Review → Ready → Scheduled → Published
          </p>
        </div>
        <PipelineStrip
          stages={stages}
          images={images}
          onGenerateImages={generateImages}
          imageLoading={imageLoading}
        />
      </section>
    </div>
  );
}
