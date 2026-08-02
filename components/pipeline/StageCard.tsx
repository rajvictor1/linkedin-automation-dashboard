import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/lib/mock-data";

interface StageCardProps {
  stage: PipelineStage;
  isSelected: boolean;
  onClick: () => void;
}

const statusClasses: Record<PipelineStage["status"], string> = {
  complete: "border-l-4 border-l-primary bg-card",
  active: "border-l-4 border-l-chart-1 bg-card shadow-md",
  pending: "border-l-4 border-l-muted bg-muted/30",
  future: "border-l-4 border-l-dashed border-l-muted-foreground/40 bg-muted/20",
};

const contentTypeLabel: Record<PipelineStage["contentType"], string> = {
  carousel: "Carousel",
  newsletter: "Newsletter",
  both: "Both",
};

export function StageCard({ stage, isSelected, onClick }: StageCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "min-w-[260px] cursor-pointer transition-all hover:-translate-y-1",
        statusClasses[stage.status],
        isSelected && "ring-2 ring-primary"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-serif text-lg leading-tight">
            {stage.label}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {contentTypeLabel[stage.contentType]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {stage.agent} • {stage.tool}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{stage.summary}</p>
      </CardContent>
    </Card>
  );
}
