"use client";

import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StageCard } from "./StageCard";
import { StageDetail } from "./StageDetail";
import type { PipelineStage } from "@/lib/mock-data";

interface PipelineStripProps {
  stages: PipelineStage[];
}

export function PipelineStrip({ stages }: PipelineStripProps) {
  const [selected, setSelected] = useState<PipelineStage | null>(stages[0] ?? null);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-stretch gap-4 py-2">
            {stages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                isSelected={selected?.id === stage.id}
                onClick={() => setSelected(stage)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Separator className="mt-2" />
      </div>

      <div className="flex-1 min-h-0">
        <StageDetail stage={selected} />
      </div>
    </div>
  );
}
