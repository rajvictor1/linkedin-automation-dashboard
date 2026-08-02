import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PipelineStage,
  SLIDE_IMAGES,
  CAROUSEL_CAPTION,
  NEWSLETTER_MARKDOWN,
} from "@/lib/mock-data";

interface StageDetailProps {
  stage: PipelineStage | null;
}

const contentTypeLabel: Record<PipelineStage["contentType"], string> = {
  carousel: "Carousel",
  newsletter: "Newsletter",
  both: "Both",
};

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function StageDetail({ stage }: StageDetailProps) {
  if (!stage) {
    return (
      <Card className="h-full min-h-[320px] flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground text-sm">
          Select a pipeline stage to inspect its output.
        </p>
      </Card>
    );
  }

  const showImages = stage.id === "visuals";
  const showExport = stage.id === "ready";

  return (
    <Card className="h-full min-h-[320px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-serif text-2xl">{stage.label}</CardTitle>
          <Badge variant={stage.status === "future" ? "secondary" : "default"}>
            {stage.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          {stage.agent} • {stage.tool} • {contentTypeLabel[stage.contentType]}
        </p>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 py-4">
        <ScrollArea className="h-full">
          {showImages && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {SLIDE_IMAGES.map((img) => (
                <div
                  key={img.slide}
                  className={cn(
                    "aspect-square rounded-lg border border-border bg-muted flex flex-col items-center justify-center gap-2 p-2 text-center",
                    "hover:bg-muted/80 transition-colors"
                  )}
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground leading-tight">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {stage.detail}
          </div>

          {showExport && (
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadFile("carousel-caption.txt", CAROUSEL_CAPTION, "text/plain")
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download caption
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadFile(
                    "newsletter.md",
                    NEWSLETTER_MARKDOWN,
                    "text/markdown"
                  )
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download newsletter
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
