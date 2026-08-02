"use client";

import { useState } from "react";
import { TopicInput } from "@/components/shared/TopicInput";
import { NewsletterEditor } from "@/components/newsletter/NewsletterEditor";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { NewsletterResult } from "@/lib/shared";

export default function NewsletterPage() {
  const [topic, setTopic] = useState("AI agents transforming enterprise automation");
  const [result, setResult] = useState<NewsletterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runNewsletter(newTopic: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic }),
      });
      const data = (await res.json()) as NewsletterResult & { error?: string };
      if ("error" in data && data.error) {
        throw new Error(data.error);
      }
      setResult(data as NewsletterResult);
      setTopic(data.topic);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Newsletter generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh bg-background p-6 lg:p-10 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground">Newsletter Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">Research, write, and export LinkedIn newsletters.</p>
        </div>
        <Badge variant="outline" className="w-fit font-mono text-xs">
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              writing…
            </span>
          ) : (
            "OpenAI + Firecrawl"
          )}
        </Badge>
      </header>

      <TopicInput
        defaultTopic={topic}
        onRun={runNewsletter}
        running={loading}
        backHref="/"
        label="Topic or trend"
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && <NewsletterEditor result={result} />}
    </div>
  );
}
