"use client";

import { useState } from "react";
import { TopicInput } from "@/components/shared/TopicInput";
import { SlideDeck } from "@/components/carousel/SlideDeck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { CarouselResult, RankedArticle } from "@/lib/shared";

export default function CarouselPage() {
  const [topic, setTopic] = useState("AI agents transforming enterprise automation");
  const [result, setResult] = useState<CarouselResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runCarousel(newTopic: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic }),
      });
      const data = (await res.json()) as CarouselResult & { error?: string };
      if ("error" in data && data.error) {
        throw new Error(data.error);
      }
      setResult(data as CarouselResult);
      setTopic(data.topic);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Carousel generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh bg-background p-6 lg:p-10 flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl text-foreground">Carousel Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">Research, rank, storyboard, and export LinkedIn carousels.</p>
        </div>
        <Badge variant="outline" className="w-fit font-mono text-xs">
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              researching…
            </span>
          ) : (
            "OpenAI + Firecrawl"
          )}
        </Badge>
      </header>

      <TopicInput
        defaultTopic={topic}
        onRun={runCarousel}
        running={loading}
        backHref="/"
        label="Topic or trend"
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Research summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k) => (
                    <Badge key={k} variant="secondary" className="font-mono text-xs">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1">Selected story</p>
                <p className="font-medium">{result.selectedArticle?.title}</p>
                <p className="text-sm text-muted-foreground">{result.selectedArticle?.source}</p>
                <p className="text-sm mt-1">{result.selectedArticle?.summary}</p>
              </div>

              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1">Top articles</p>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {result.articles.map((a: RankedArticle) => (
                    <li key={a.url}>
                      <a href={a.url} target="_blank" rel="noreferrer" className="underline">
                        {a.title}
                      </a>
                      {" "}
                      <span className="text-muted-foreground">({a.source}, score {a.score}) — {a.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <SlideDeck
            topic={result.topic}
            initialSlides={result.slides}
            caption={result.caption}
            hashtags={result.hashtags}
          />
        </div>
      )}
    </div>
  );
}
