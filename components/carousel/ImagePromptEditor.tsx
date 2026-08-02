"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ImagePromptEditorProps {
  prompts: string[];
  onGenerate: (prompts: string[]) => void;
  imageLoading: boolean;
}

export function ImagePromptEditor({
  prompts,
  onGenerate,
  imageLoading,
}: ImagePromptEditorProps) {
  const [localPrompts, setLocalPrompts] = useState(prompts);

  return (
    <Card className="bg-muted/30">
      <CardContent className="py-4 space-y-3">
        <p className="text-xs font-mono text-muted-foreground">
          Review/edit image prompts for each slide before generating.
        </p>
        {localPrompts.map((prompt, i) => (
          <div key={i} className="space-y-1">
            <label className="text-xs font-medium">Slide {i + 1}</label>
            <Textarea
              value={prompt}
              onChange={(e) => {
                const next = [...localPrompts];
                next[i] = e.target.value;
                setLocalPrompts(next);
              }}
              rows={3}
              className="text-xs"
            />
          </div>
        ))}
        <Button
          onClick={() => onGenerate(localPrompts)}
          disabled={imageLoading || localPrompts.length === 0}
        >
          {imageLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Generate slide images
        </Button>
      </CardContent>
    </Card>
  );
}
