"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TopicInputProps {
  defaultTopic: string;
  defaultMode: "carousel" | "newsletter" | "both";
  onRun: (topic: string, mode: "carousel" | "newsletter" | "both") => void;
  running: boolean;
}

export function TopicInput({ defaultTopic, defaultMode, onRun, running }: TopicInputProps) {
  const [topic, setTopic] = useState(defaultTopic);
  const [mode, setMode] = useState<"carousel" | "newsletter" | "both">(defaultMode);

  return (
    <Card className="bg-card">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-end gap-4 py-4">
        <div className="flex-1 w-full">
          <label
            htmlFor="topic"
            className="block text-xs font-mono text-muted-foreground mb-1.5"
          >
            Topic or URL
          </label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic or paste a URL"
            className="font-serif"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label
            htmlFor="mode"
            className="block text-xs font-mono text-muted-foreground mb-1.5"
          >
            Format
          </label>
          <select
            id="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            className="flex h-9 w-full sm:w-[160px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="both">Both</option>
            <option value="carousel">Carousel</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>
        <Button onClick={() => onRun(topic, mode)} disabled={running} className="w-full sm:w-auto">
          {running && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Run pipeline
        </Button>
      </CardContent>
    </Card>
  );
}
