"use client";

import { useState } from "react";
import { TopicInput } from "@/components/TopicInput";
import { PipelineStrip } from "@/components/pipeline/PipelineStrip";
import { PIPELINE_STAGES, DEFAULT_TOPIC } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const [topic, setTopic] = useState(DEFAULT_TOPIC);

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
        <Badge variant="outline" className="w-fit font-mono text-xs">
          Mock data only
        </Badge>
      </header>

      <TopicInput defaultTopic={topic} onRun={setTopic} />

      <section className="flex-1 min-h-[480px] flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl">Pipeline: {topic}</h2>
          <p className="text-xs text-muted-foreground font-mono">
            Ideas → Research → Writing → Visuals → Review → Ready → Scheduled → Published
          </p>
        </div>
        <PipelineStrip stages={PIPELINE_STAGES} />
      </section>
    </div>
  );
}
