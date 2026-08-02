"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TopicInputProps {
  defaultTopic: string;
  onRun: (topic: string) => void;
  running: boolean;
  backHref: string;
  label?: string;
}

export function TopicInput({
  defaultTopic,
  onRun,
  running,
  backHref,
  label = "Topic",
}: TopicInputProps) {
  const [topic, setTopic] = useState(defaultTopic);

  return (
    <Card className="bg-card">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-end gap-4 py-4">
        <Link href={backHref} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex-1 w-full">
          <label
            htmlFor="topic"
            className="block text-xs font-mono text-muted-foreground mb-1.5"
          >
            {label}
          </label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. AI agents transforming enterprise automation"
            className="font-serif"
          />
        </div>
        <Button onClick={() => onRun(topic)} disabled={running} className="w-full sm:w-auto">
          {running && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Research &amp; draft
        </Button>
      </CardContent>
    </Card>
  );
}
