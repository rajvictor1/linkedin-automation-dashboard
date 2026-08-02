"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ImageIcon, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PipelineStage,
  type PipelineResult,
  type GeneratedImage,
  downloadFile,
} from "@/lib/mock-data";

interface StageDetailProps {
  stage: PipelineStage | null;
  images: GeneratedImage[];
  onGenerateImages: () => void;
  imageLoading: boolean;
}

const contentTypeLabel: Record<PipelineStage["contentType"], string> = {
  carousel: "Carousel",
  newsletter: "Newsletter",
  both: "Both",
};

export function StageDetail({
  stage,
  images,
  onGenerateImages,
  imageLoading,
}: StageDetailProps) {
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
  const data = stage.data as PipelineResult | undefined;

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
            <div className="mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {images.map((img) => (
                  <div
                    key={img.slide}
                    className={cn(
                      "aspect-square rounded-lg border border-border bg-muted flex flex-col items-center justify-center gap-2 p-2 text-center overflow-hidden",
                      "hover:bg-muted/80 transition-colors"
                    )}
                  >
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={`Slide ${img.slide}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground leading-tight">
                          Slide {img.slide}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <Button
                onClick={onGenerateImages}
                disabled={imageLoading || images.length === 0}
                size="sm"
              >
                {imageLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate slide images
              </Button>
            </div>
          )}

          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {stage.detail}
          </div>

          {showExport && data && (
            <div className="flex flex-wrap gap-3 mt-6">
              {data.carousel?.caption && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile("carousel-caption.txt", data.carousel.caption, "text/plain")
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download caption
                </Button>
              )}
              {data.newsletter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile("newsletter.md", data.newsletter, "text/markdown")
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download newsletter
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
