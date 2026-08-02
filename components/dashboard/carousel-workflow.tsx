"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, RefreshCw, Download, Send, ExternalLink } from "lucide-react"
import type { CarouselProgressEvent, CarouselRun, CarouselSlide } from "@/lib/types"
import { downloadFile } from "@/lib/utils"

export function CarouselWorkflow() {
  const [run, setRun] = useState<CarouselRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ node: string; message: string; percent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [commentary, setCommentary] = useState("")
  const [publishLoading, setPublishLoading] = useState(false)
  const [publishStatus, setPublishStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [confirmText, setConfirmText] = useState("")

  async function start() {
    setRun(null)
    setError(null)
    setProgress({ node: "discovery", message: "Starting research...", percent: 5 })
    setLoading(true)
    setPublishStatus(null)
    setCommentary("")

    try {
      const res = await fetch("/api/carousels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let buffer = ""
      let percent = 5

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line) as CarouselProgressEvent
            if (event.type === "progress") {
              if (event.node === "images") percent = Math.min(percent + 12, 95)
              else percent = Math.min(percent + 15, 90)
              setProgress({ node: event.node, message: event.message, percent })
            } else if (event.type === "complete") {
              setRun(event.data)
              setCommentary(buildDefaultCommentary(event.data))
              setProgress({ node: "review", message: "Ready for review", percent: 100 })
            } else if (event.type === "error") {
              setError(event.error.message)
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  function buildDefaultCommentary(run: CarouselRun) {
    return `🚀 ${run.topic}\n\n${run.slides.map((s) => `${s.index}. ${s.title}`).join("\n")}\n\nSource: ${run.selectedArticle.title}\n${run.selectedArticle.url}`
  }

  function exportPackage() {
    if (!run) return
    const text = run.slides.map((s) => `Slide ${s.index}: ${s.title}\n${s.body}`).join("\n\n")
    downloadFile("carousel-caption.txt", text)
  }

  async function publish() {
    if (!run) return
    if (confirmText !== "PUBLISH TO LINKEDIN") {
      setPublishStatus({ type: "error", message: 'Type "PUBLISH TO LINKEDIN" to confirm.' })
      return
    }
    setPublishLoading(true)
    setPublishStatus(null)
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "PUBLISH TO LINKEDIN", commentary, run }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setPublishStatus({ type: "error", message: data.error?.message || "Publish failed" })
      } else {
        setPublishStatus({ type: "success", message: `Published to LinkedIn: ${data.postUrn}` })
      }
    } catch (err) {
      setPublishStatus({ type: "error", message: err instanceof Error ? err.message : String(err) })
    } finally {
      setPublishLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Generate carousel from current news</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            This discovers timely AI, automation, and enterprise IT stories, selects the strongest one, writes 4 content slides, and renders all 5 as artwork.
          </p>
          <Button onClick={start} disabled={loading} className="w-fit">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {loading ? "Generating..." : "Run carousel pipeline"}
          </Button>

          {progress && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span className="capitalize">{progress.node}</span>
                <span>{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} className="h-2" />
              <p className="text-xs text-[var(--muted-foreground)]">{progress.message}</p>
            </div>
          )}

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        </CardContent>
      </Card>

      {run && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="font-semibold">Slides ({run.slides.length})</h2>
            {run.slides.map((slide) => (
              <SlideCard key={slide.index} slide={slide} />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Selected story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">{run.selectedArticle.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{run.selectedArticle.summary}</p>
                <a href={run.selectedArticle.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  Read source <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">LinkedIn commentary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={commentary} onChange={(e) => setCommentary(e.target.value)} rows={6} />
                <Button variant="outline" onClick={exportPackage} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Export caption
                </Button>

                <div className="space-y-2">
                  <p className="text-xs text-[var(--muted-foreground)]">Type PUBLISH TO LINKEDIN to confirm:</p>
                  <Textarea value={confirmText} onChange={(e) => setConfirmText(e.target.value)} rows={2} />
                  <Button onClick={publish} disabled={publishLoading} className="w-full">
                    {publishLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Publish to LinkedIn
                  </Button>
                  {publishStatus && (
                    <div className={`rounded-md p-3 text-xs ${publishStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {publishStatus.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function SlideCard({ slide }: { slide: CarouselSlide }) {
  return (
    <Card className="overflow-hidden bg-[var(--card)] border-[var(--border)]">
      <div className="grid md:grid-cols-2">
        {slide.imageDataUrl ? (
          <img src={slide.imageDataUrl} alt={slide.title} className="aspect-square w-full object-cover bg-[var(--muted)]" />
        ) : (
          <div className="aspect-square w-full bg-[var(--muted)] flex items-center justify-center text-sm text-[var(--muted-foreground)]">No image rendered</div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Slide {slide.index}</Badge>
            {slide.kind === "cta" && <Badge variant="secondary">CTA</Badge>}
          </div>
          <h3 className="font-semibold text-lg">{slide.title}</h3>
          <p className="text-sm text-[var(--muted-foreground)]">{slide.body}</p>
          <div className="pt-2 text-xs text-[var(--muted-foreground)]">
            Watermark: {slide.watermark}
          </div>
        </div>
      </div>
    </Card>
  )
}
