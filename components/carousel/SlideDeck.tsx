"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Download, Loader2, ImageIcon } from "lucide-react";
import type { CarouselSlide, GeneratedImage } from "@/lib/shared";
import { downloadFile } from "@/lib/shared";
import { ImagePromptEditor } from "./ImagePromptEditor";

interface SlideDeckProps {
  topic: string;
  initialSlides: CarouselSlide[];
  caption: string;
  hashtags: string[];
}

export function SlideDeck({ topic, initialSlides, caption, hashtags }: SlideDeckProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides);
  const [localCaption, setLocalCaption] = useState(caption);
  const [images, setImages] = useState<GeneratedImage[]>(
    initialSlides.map((s) => ({
      slide: s.index,
      prompt: s.visualPrompt,
      url: s.imageUrl || null,
      loading: false,
    }))
  );
  const [imageLoading, setImageLoading] = useState(false);

  async function generateImages(prompts: string[]) {
    setImageLoading(true);
    const nextImages = images.map((img, i) => ({
      ...img,
      prompt: prompts[i] || img.prompt,
      loading: true,
    }));
    setImages(nextImages);

    try {
      await Promise.all(
        nextImages.map(async (img, i) => {
          const res = await fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: img.prompt }),
          });
          const data = (await res.json()) as { url?: string; error?: string };
          nextImages[i] = {
            ...img,
            url: data.url || null,
            loading: false,
            error: data.error,
          };
          setSlides((prev) => {
            const copy = [...prev];
            copy[i] = { ...copy[i], imageUrl: data.url || undefined };
            return copy;
          });
        })
      );
      setImages([...nextImages]);
    } catch (err) {
      console.error(err);
      alert("Image generation failed");
    } finally {
      setImageLoading(false);
    }
  }

  function exportPackage() {
    const packageText = `Topic: ${topic}\n\nCaption:\n${localCaption}\n\nSlides:\n\n${slides
      .map((s, i) => `Slide ${i + 1}\nHeadline: ${s.headline}\nBody: ${s.body}\nImage prompt: ${s.visualPrompt}\nImage: ${s.imageUrl || "not generated"}`)
      .join("\n\n---\n\n")}\n\nHashtags: ${hashtags.join(" ")}`;
    downloadFile("carousel-package.txt", packageText, "text/plain");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide, i) => (
          <Card key={slide.index} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {images[i]?.url ? (
                <img
                  src={images[i].url!}
                  alt={`Slide ${slide.index}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs font-mono">No image yet</span>
                </div>
              )}
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground">Headline</label>
                <Input
                  value={slide.headline}
                  onChange={(e) => {
                    const next = [...slides];
                    next[i] = { ...slide, headline: e.target.value };
                    setSlides(next);
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground">Body</label>
                <Textarea
                  value={slide.body}
                  onChange={(e) => {
                    const next = [...slides];
                    next[i] = { ...slide, body: e.target.value };
                    setSlides(next);
                  }}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ImagePromptEditor
        prompts={images.map((img) => img.prompt)}
        onGenerate={generateImages}
        imageLoading={imageLoading}
      />

      <Card className="bg-muted/30">
        <CardContent className="py-4 space-y-3">
          <label className="text-xs font-mono text-muted-foreground">LinkedIn caption</label>
          <Textarea
            value={localCaption}
            onChange={(e) => setLocalCaption(e.target.value)}
            rows={6}
            className="text-sm"
          />
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {hashtags.map((h) => (
              <span key={h} className="bg-background border rounded px-2 py-0.5">#{h}</span>
            ))}
          </div>
          <Button onClick={exportPackage}>
            <Download className="w-4 h-4 mr-2" />
            Export carousel package
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
