"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface TopicInputProps {
  defaultTopic: string;
  onRun: (topic: string) => void;
}

export function TopicInput({ defaultTopic, onRun }: TopicInputProps) {
  const [topic, setTopic] = useState(defaultTopic);

  return (
    <Card className="bg-card">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
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
        <Button onClick={() => onRun(topic)} className="mt-5 sm:mt-0">
          Run pipeline
        </Button>
      </CardContent>
    </Card>
  );
}
